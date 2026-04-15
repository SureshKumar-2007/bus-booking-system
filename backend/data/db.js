import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/awt-bus-booking';

export async function initDb() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
    await seedTripsIfEmpty();
    await seedBusesIfEmpty();
    await seedAdminIfNotExists();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);

// Trip Schema
const tripSchema = new mongoose.Schema({
  operator: String,
  type: String,
  busNumber: String,
  rating: Number,
  reviews: Number,
  price: Number,
  currency: String,
  departure: String,
  arrival: String,
  duration: String,
  from: String,
  to: String,
  route: String,
  seats: Number,
  amenities: [String],
  boardingPoints: [String],
  droppingPoints: [String],
  policies: [String],
  bookedSeats: [String],
  seatMap: [
    {
      id: String,
      status: { type: String, enum: ['available', 'booked'], default: 'available' },
    },
  ],
}, { timestamps: true });

export const Trip = mongoose.model('Trip', tripSchema);

// Bus Schema
const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  operator: { type: String, required: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Bus = mongoose.model('Bus', busSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  seats: [String],
  contact: {
    email: String,
    phone: String,
  },
  passengers: {
    count: Number,
    details: [
      {
        name: String,
        age: Number,
        gender: String,
      },
    ],
  },
  totalFare: Number,
  currency: String,
  status: { type: String, default: 'confirmed' },
  pnr: String,
  createdAt: { type: Date, default: Date.now },
  summary: {
    operator: String,
    route: String,
    departure: String,
    arrival: String,
    pricePerSeat: Number,
    seatsLeft: Number,
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);

// Announcement Schema for admin to post announcements
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

export const Announcement = mongoose.model('Announcement', announcementSchema);

// Activity Log Schema for tracking admin operations
const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminEmail: String,
  action: { type: String, required: true }, // e.g., 'CREATE_TRIP', 'DELETE_BOOKING', 'UPDATE_TRIP'
  resourceType: String, // e.g., 'Trip', 'Booking', 'User'
  resourceId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed, // What was changed
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Refund Schema for tracking refund requests and status
const refundSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  refundAmount: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  reason: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  processedAt: Date,
});

export const Refund = mongoose.model('Refund', refundSchema);

// Seed sample trips
async function seedTripsIfEmpty() {
  const count = await Trip.countDocuments();
  if (count === 0) {
    const sampleTrips = [
      {
        operator: 'Zingbus AC Sleeper',
        type: 'AC Sleeper (2+1)',
        busNumber: 'MH 01 AB 1234',
        rating: 4.8,
        reviews: 124,
        price: 450,
        currency: 'INR',
        departure: '22:00',
        arrival: '06:00',
        duration: '08h 00m',
        from: 'Mumbai',
        to: 'Pune',
        route: 'Mumbai → Lonavala → Pune',
        seats: 40,
        amenities: ['WiFi', 'Blanket', 'Water Bottle'],
        boardingPoints: ['Dadar East (22:00)', 'Sion Circle (22:15)', 'Vashi (22:45)'],
        droppingPoints: ['Wakad (05:00)', 'Hinjewadi (05:30)', 'Swargate (06:00)'],
        policies: [
          'Cancellation allowed up to 12 hours before departure.',
          'Partial refund available.',
          'Luggage limit strictly 15kg per passenger.',
        ],
        bookedSeats: ['1A', '1B', '4C', '4D', '5A', '7B', '8C', '8D', '10A'],
        seatMap: generateSeatMap(['1A', '1B', '4C', '4D', '5A', '7B', '8C', '8D', '10A']),
      },
      {
        operator: 'IntrCity SmartBus',
        type: 'AC Semi-Sleeper',
        busNumber: 'MH 14 CD 5678',
        rating: 4.5,
        reviews: 98,
        price: 650,
        currency: 'INR',
        departure: '23:30',
        arrival: '07:00',
        duration: '07h 30m',
        from: 'Delhi',
        to: 'Jaipur',
        route: 'Delhi → Expressway → Jaipur',
        seats: 40,
        amenities: ['Charging Point', 'Reading Light'],
        boardingPoints: ['Kashmere Gate (23:30)', 'Dhaula Kuan (00:00)'],
        droppingPoints: ['Sindhi Camp (05:00)', 'Narayan Singh Circle (05:30)'],
        policies: [
          'Cancellation allowed up to 12 hours before departure.',
          'Meals not included.',
          'Carry your valid ID at boarding.',
        ],
        bookedSeats: ['2A', '3B', '7C', '9D'],
        seatMap: generateSeatMap(['2A', '3B', '7C', '9D']),
      },
      {
        operator: 'VRL Travels',
        type: 'Non-AC Sleeper',
        busNumber: 'KA 25 EF 9012',
        rating: 4.2,
        reviews: 210,
        price: 850,
        currency: 'INR',
        departure: '21:00',
        arrival: '06:30',
        duration: '09h 30m',
        from: 'Bangalore',
        to: 'Chennai',
        route: 'Bangalore → Panvel → Chennai',
        seats: 40,
        amenities: ['Pillow', 'Emergency Contact'],
        boardingPoints: ['Majestic (21:00)', 'Madiwala (21:30)'],
        droppingPoints: ['Koyambedu (04:00)', 'Guindy (04:30)'],
        policies: [
          'Cancellation allowed up to 12 hours before departure.',
          'No meal included.',
          'Carry your passenger ID during boarding.',
        ],
        bookedSeats: ['1D', '5C', '6A', '10B'],
        seatMap: generateSeatMap(['1D', '5C', '6A', '10B']),
      },
      {
        operator: 'Orange Tours',
        type: 'Volvo Multi-Axle AC',
        busNumber: 'TS 09 GH 3456',
        rating: 4.9,
        reviews: 345,
        price: 1200,
        currency: 'INR',
        departure: '23:45',
        arrival: '06:15',
        duration: '06h 30m',
        from: 'Hyderabad',
        to: 'Vijayawada',
        route: 'Hyderabad → Vashi → Vijayawada',
        seats: 40,
        amenities: ['AC', 'Snacks', 'TV', 'WiFi'],
        boardingPoints: ['Ameerpet (23:45)', 'LB Nagar (00:15)'],
        droppingPoints: ['Benz Circle (05:00)', 'RTC Bus Stand (05:15)'],
        policies: [
          'Cancellation allowed up to 12 hours before departure.',
          'Extra luggage charged separately.',
          'Respect safety announcements.',
        ],
        bookedSeats: ['3A', '3B', '8D'],
        seatMap: generateSeatMap(['3A', '3B', '8D']),
      },
    ];
    await Trip.insertMany(sampleTrips);
    console.log('✓ Sample trips seeded');
  }
}

// Seed sample buses
async function seedBusesIfEmpty() {
  const count = await Bus.countDocuments();
  if (count === 0) {
    const sampleBuses = [
      {
        busNumber: 'MH 01 AB 1234',
        operator: 'Zingbus AC Sleeper',
        type: 'AC Sleeper (2+1)',
        capacity: 40,
        amenities: ['WiFi', 'Blanket', 'Water Bottle']
      },
      {
        busNumber: 'MH 14 CD 5678',
        operator: 'IntrCity SmartBus',
        type: 'AC Semi-Sleeper',
        capacity: 40,
        amenities: ['Charging Point', 'Reading Light']
      },
      {
        busNumber: 'KA 25 EF 9012',
        operator: 'VRL Travels',
        type: 'Non-AC Sleeper',
        capacity: 40,
        amenities: ['Pillow', 'Emergency Contact']
      },
      {
        busNumber: 'TS 09 GH 3456',
        operator: 'Orange Tours',
        type: 'Volvo Multi-Axle AC',
        capacity: 40,
        amenities: ['AC', 'Snacks', 'TV', 'WiFi']
      }
    ];
    await Bus.insertMany(sampleBuses);
    console.log('✓ Sample buses seeded');
  }
}

async function seedAdminIfNotExists() {
  const adminEmail = 'suresh@dev.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  
  if (!existingAdmin) {
    const hashedPassword = await bcryptjs.hash('123456', 10);
    await User.create({
      name: 'Admin Suresh',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✓ Admin user created: suresh@dev.com / 123456');
  } else {
    console.log('✓ Admin user already exists');
  }
}

function generateSeatMap(bookedSeats = []) {
  const seatMap = [];
  const seatLetters = ['A', 'B', 'C', 'D'];
  for (let row = 1; row <= 10; row++) {
    for (const letter of seatLetters) {
      const seatId = `${row}${letter}`;
      seatMap.push({
        id: seatId,
        status: bookedSeats.includes(seatId) ? 'booked' : 'available',
      });
    }
  }
  return seatMap;
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export async function getSeatsLeft(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) return 0;
  return trip.seatMap.filter((seat) => seat.status === 'available').length;
}
