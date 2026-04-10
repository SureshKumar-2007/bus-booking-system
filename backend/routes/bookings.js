import express from 'express';
import { Trip, Booking } from '../data/db.js';
import { authenticateToken } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

const createPNR = () => `PNR${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId, seats, contact, passengers } = req.body;
    const userId = req.user.id;

    if (!tripId || !Array.isArray(seats) || seats.length === 0 || !contact || !passengers) {
      return res.status(400).json({ error: 'tripId, seats, contact, and passengers are required.' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const unavailableSeats = seats.filter((seatId) => {
      const seat = trip.seatMap.find((item) => item.id === seatId);
      return !seat || seat.status !== 'available';
    });

    if (unavailableSeats.length) {
      return res.status(409).json({ error: 'Some seats are no longer available.', unavailableSeats });
    }

    seats.forEach((seatId) => {
      const seat = trip.seatMap.find((item) => item.id === seatId);
      if (seat) seat.status = 'booked';
    });

    const totalFare = trip.price * seats.length;
    const booking = await Booking.create({
      userId,
      tripId: new mongoose.Types.ObjectId(tripId),
      seats,
      contact: {
        email: contact.email,
        phone: contact.phone
      },
      passengers,
      totalFare,
      currency: trip.currency,
      status: 'confirmed',
      pnr: createPNR(),
      summary: {
        operator: trip.operator,
        route: trip.route,
        departure: trip.departure,
        arrival: trip.arrival,
        pricePerSeat: trip.price,
        seatsLeft: trip.seatMap.filter((s) => s.status === 'available').length
      }
    });

    trip.bookedSeats = [...(trip.bookedSeats || []), ...seats];
    await trip.save();

    return res.status(201).json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Failed to create booking.' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    return res.json({ bookings });
  } catch (error) {
    console.error('List bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking || booking.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    return res.json({ booking });
  } catch (error) {
    console.error('Booking details error:', error);
    return res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

router.put('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Only allow status updates (e.g., cancel booking)
    if (status && ['confirmed', 'cancelled'].includes(status)) {
      booking.status = status;
      await booking.save();

      // If cancelling, free up the seats
      if (status === 'cancelled') {
        const trip = await Trip.findById(booking.tripId);
        if (trip) {
          booking.seats.forEach((seatId) => {
            const seat = trip.seatMap.find((s) => s.id === seatId);
            if (seat) seat.status = 'available';
          });
          trip.bookedSeats = trip.bookedSeats.filter(seat => !booking.seats.includes(seat));
          await trip.save();
        }
      }

      return res.json({
        message: `Booking ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully.`,
        booking
      });
    }

    return res.status(400).json({ error: 'Invalid update operation.' });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ error: 'Failed to update booking.' });
  }
});

router.delete('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Free up the seats
    const trip = await Trip.findById(booking.tripId);
    if (trip) {
      booking.seats.forEach((seatId) => {
        const seat = trip.seatMap.find((s) => s.id === seatId);
        if (seat) seat.status = 'available';
      });
      trip.bookedSeats = trip.bookedSeats.filter(seat => !booking.seats.includes(seat));
      await trip.save();
    }

    await Booking.findByIdAndDelete(bookingId);

    return res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

export default router;
