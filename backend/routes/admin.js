import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Trip, Booking, Announcement, ActivityLog, Refund, normalizeEmail } from '../data/db.js';
import mongoose from 'mongoose';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'awt-secret-key';
const TOKEN_EXPIRES = '24h';

// Admin Authentication Middleware
const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Helper function to log admin activities
async function logActivity(adminId, adminEmail, action, resourceType, resourceId, changes, description) {
  try {
    await ActivityLog.create({
      adminId,
      adminEmail,
      action,
      resourceType,
      resourceId,
      changes,
      description
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard Stats
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTrips = await Trip.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const bookingsData = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalFare' } } }
    ]);
    const totalRevenue = bookingsData[0]?.totalRevenue || 0;

    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('tripId', 'busNumber from to')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({
      stats: {
        totalUsers,
        totalTrips,
        totalBookings,
        totalRevenue: totalRevenue.toFixed(2)
      },
      recentBookings: recentBookings.map(booking => ({
        _id: booking._id,
        bookingId: booking._id.toString().slice(-8),
        passengerName: booking.userId?.name || 'Unknown',
        passengerEmail: booking.userId?.email || 'Unknown',
        busNumber: booking.tripId?.busNumber || 'Unknown',
        route: `${booking.tripId?.from || ''} → ${booking.tripId?.to || ''}`,
        totalAmount: booking.totalFare,
        status: booking.status,
        createdAt: booking.createdAt
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get Users with Pagination & Search
router.get('/users', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    return res.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get Trips with Pagination & Search
router.get('/trips', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { busNumber: { $regex: search, $options: 'i' } },
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } }
      ];
    }

    const trips = await Trip.find(filter)
      .skip(skip)
      .limit(limit)
      .lean();

    const enrichedTrips = trips.map(trip => ({
      ...trip,
      availableSeats: trip.seatMap.filter(s => s.status === 'available').length
    }));

    const total = await Trip.countDocuments(filter);

    return res.json({
      trips: enrichedTrips,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Trips fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Create Trip
router.post('/trips', adminAuthMiddleware, async (req, res) => {
  try {
    const { busNumber, from, to, departureTime, arrivalTime, price, totalSeats } = req.body;

    if (!busNumber || !from || !to || !departureTime || !arrivalTime || !price || !totalSeats) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const seatMap = [];
    const seatLetters = ['A', 'B', 'C', 'D'];
    for (let row = 1; row <= Math.ceil(totalSeats / 4); row++) {
      for (const letter of seatLetters) {
        if (seatMap.length < totalSeats) {
          seatMap.push({
            id: `${row}${letter}`,
            status: 'available'
          });
        }
      }
    }

    const newTrip = await Trip.create({
      busNumber,
      from,
      to,
      departure: new Date(departureTime).toLocaleTimeString('en-US', { hour12: true }),
      arrival: new Date(arrivalTime).toLocaleTimeString('en-US', { hour12: true }),
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      duration: calculateDuration(new Date(departureTime), new Date(arrivalTime)),
      price: parseFloat(price),
      seats: totalSeats,
      seatMap,
      rating: 4.5,
      reviews: 0,
      operator: 'GoBus',
      type: 'AC',
      route: `${from} → ${to}`,
      amenities: ['WiFi', 'Water Bottle'],
      boardingPoints: [`${from} (${new Date(departureTime).toLocaleTimeString()})`],
      droppingPoints: [`${to} (${new Date(arrivalTime).toLocaleTimeString()})`],
      policies: ['Cancellation allowed up to 12 hours before departure.'],
      bookedSeats: [],
      currency: 'INR'
    });

    return res.status(201).json({ trip: newTrip });
  } catch (error) {
    console.error('Trip creation error:', error);
    return res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update Trip
router.put('/trips/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { price, amenities } = req.body;
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { price, amenities } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({ trip });
  } catch (error) {
    console.error('Trip update error:', error);
    return res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete Trip
router.delete('/trips/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findByIdAndDelete(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Trip delete error:', error);
    return res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Get Bookings with Pagination, Search & Filter
router.get('/bookings', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { 'userId.email': { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('tripId', 'busNumber from to departureTime')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const enrichedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingId: booking._id.toString().slice(-8),
      passengerName: booking.userId?.name || 'Unknown',
      passengerEmail: booking.userId?.email || 'Unknown',
      busNumber: booking.tripId?.busNumber || 'Unknown',
      from: booking.tripId?.from || '',
      to: booking.tripId?.to || '',
      seatsBooked: booking.seats,
      totalAmount: booking.totalFare,
      status: booking.status,
      createdAt: booking.createdAt,
      trip: booking.tripId
    }));

    const total = await Booking.countDocuments(filter);

    return res.json({
      bookings: enrichedBookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update Booking Status
router.put('/bookings/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      { new: true }
    ).populate('userId', 'name email').populate('tripId', 'busNumber from to');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json({ booking });
  } catch (error) {
    console.error('Booking status update error:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete Booking
router.delete('/bookings/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Booking delete error:', error);
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Helper function to calculate duration
function calculateDuration(departure, arrival) {
  const diff = (arrival - departure) / 1000 / 60; // Convert to minutes
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes}m`;
}

// ============ FEATURE 1: ADVANCED ANALYTICS ============
router.get('/analytics', adminAuthMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Revenue by route
    const revenueByRoute = await Booking.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'trips',
          localField: 'tripId',
          foreignField: '_id',
          as: 'trip'
        }
      },
      { $unwind: '$trip' },
      {
        $group: {
          _id: '$trip.route',
          totalRevenue: { $sum: '$totalFare' },
          bookingCount: { $sum: 1 },
          avgPrice: { $avg: '$totalFare' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Booking trends (last 30 days)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const bookingTrends = await Booking.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalFare' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top routes by popularity
    const topRoutes = await Booking.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'trips',
          localField: 'tripId',
          foreignField: '_id',
          as: 'trip'
        }
      },
      { $unwind: '$trip' },
      {
        $group: {
          _id: '$trip.route',
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    // Cancellation rate
    const totalBookings = await Booking.countDocuments(dateFilter);
    const cancelledBookings = await Booking.countDocuments({
      ...dateFilter,
      status: 'cancelled'
    });
    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(2) : 0;

    return res.json({
      revenueByRoute,
      bookingTrends,
      statusBreakdown,
      topRoutes,
      cancellationRate,
      totalBookings,
      cancelledBookings
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ FEATURE 2: REFUND MANAGEMENT ============
// Process refund request
router.post('/bookings/:id/refund', adminAuthMiddleware, async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const refund = await Refund.create({
      bookingId: booking._id,
      userId: booking.userId,
      tripId: booking.tripId,
      refundAmount: refundAmount || booking.totalFare,
      reason,
      status: 'pending'
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'PROCESS_REFUND',
      'Booking',
      booking._id,
      { refundAmount, reason },
      `Refund processed for booking ${bookingId}`
    );

    return res.status(201).json({ refund });
  } catch (error) {
    console.error('Refund processing error:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get all refunds
router.get('/refunds', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || '';
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const refunds = await Refund.find(filter)
      .populate('userId', 'name email')
      .populate('bookingId')
      .populate('tripId', 'busNumber from to')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Refund.countDocuments(filter);

    return res.json({
      refunds,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Refunds fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

// Update refund status
router.put('/refunds/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const refundId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(refundId)) {
      return res.status(400).json({ error: 'Invalid refund ID' });
    }

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const refund = await Refund.findByIdAndUpdate(
      refundId,
      {
        $set: {
          status,
          notes,
          processedBy: req.user.id,
          processedAt: new Date()
        }
      },
      { new: true }
    ).populate('userId', 'name email').populate('tripId', 'busNumber from to');

    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    await logActivity(
      req.user.id,
      req.user.email,
      'UPDATE_REFUND_STATUS',
      'Refund',
      refund._id,
      { status, notes },
      `Refund status updated to ${status}`
    );

    return res.json({ refund });
  } catch (error) {
    console.error('Refund status update error:', error);
    return res.status(500).json({ error: 'Failed to update refund' });
  }
});

// ============ FEATURE 3: EXPORT REPORTS ============
// Export bookings as CSV
router.get('/reports/bookings', adminAuthMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('tripId', 'busNumber from to price')
      .lean();

    let csv = 'Booking ID,Passenger Name,Email,Bus Number,Route,Amount,Status,Date\n';
    bookings.forEach(booking => {
      csv += `"${booking._id}","${booking.userId?.name || 'N/A'}","${booking.userId?.email || 'N/A'}","${booking.tripId?.busNumber || 'N/A'}","${booking.tripId?.from || ''} → ${booking.tripId?.to || ''}",${booking.totalFare},"${booking.status}","${booking.createdAt.toISOString()}"\n`;
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'EXPORT_BOOKINGS',
      'Report',
      null,
      { filter },
      `Exported ${bookings.length} bookings to CSV`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export bookings error:', error);
    return res.status(500).json({ error: 'Failed to export bookings' });
  }
});

// Export trips as CSV
router.get('/reports/trips', adminAuthMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find().lean();

    let csv = 'Bus Number,From,To,Departure,Arrival,Price,Total Seats,Available Seats,Operator\n';
    trips.forEach(trip => {
      const availableSeats = trip.seatMap.filter(s => s.status === 'available').length;
      csv += `"${trip.busNumber}","${trip.from}","${trip.to}","${trip.departure}","${trip.arrival}",${trip.price},${trip.seats},${availableSeats},"${trip.operator}"\n`;
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'EXPORT_TRIPS',
      'Report',
      null,
      {},
      `Exported ${trips.length} trips to CSV`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trips-report.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export trips error:', error);
    return res.status(500).json({ error: 'Failed to export trips' });
  }
});

// ============ FEATURE 4: ADMIN ACTIVITY LOG ============
router.get('/activity-logs', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const action = req.query.action || '';
    const limit = 15;
    const skip = (page - 1) * limit;

    const filter = {};
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .populate('adminId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await ActivityLog.countDocuments(filter);

    return res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Activity logs fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// ============ FEATURE 5: ANNOUNCEMENTS ============
// Create announcement
router.post('/announcements', adminAuthMiddleware, async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      createdBy: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'CREATE_ANNOUNCEMENT',
      'Announcement',
      announcement._id,
      { title, message, type },
      `Announcement created: ${title}`
    );

    return res.status(201).json({ announcement });
  } catch (error) {
    console.error('Announcement creation error:', error);
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get all active announcements
router.get('/announcements', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Announcement.countDocuments();

    return res.json({
      announcements,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Delete announcement
router.delete('/announcements/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await logActivity(
      req.user.id,
      req.user.email,
      'DELETE_ANNOUNCEMENT',
      'Announcement',
      announcement._id,
      {},
      `Announcement deleted: ${announcement.title}`
    );

    return res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Announcement delete error:', error);
    return res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;
