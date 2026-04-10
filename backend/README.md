# AWT Backend - Bus Booking API

Express.js backend server for a comprehensive bus booking and ticketing system with user authentication, trip management, and admin capabilities.

## Features

- **User Authentication** - JWT-based signup and login
- **Trip Management** - Create and manage bus trips
- **Seat Management** - Dynamic seat allocation with pricing
- **Booking System** - Complete booking lifecycle
- **Admin Dashboard** - Comprehensive admin analytics and management
- **Refund Processing** - Handle booking cancellations and refunds
- **Activity Logging** - Track all system activities
- **Data Persistence** - JSON-based database with lowdb

## Tech Stack

- **Express.js** - Web framework
- **lowdb** - JSON database
- **JWT** - Authentication
- **CORS** - Cross-origin request handling
- **dotenv** - Environment configuration

## Project Structure

```
backend/
├── routes/          # API route handlers
│   ├── auth.js      # Authentication routes
│   ├── trips.js     # Trip management routes
│   ├── bookings.js  # Booking routes
│   └── admin.js     # Admin management routes
├── middleware/      # Custom middleware
│   └── auth.js      # JWT authentication middleware
├── data/           # Data layer
│   ├── db.js       # Database initialization
│   └── db.json     # JSON database file
├── server.js       # Main server file
└── package.json
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/signup` - Register a new user
  - Body: `{ name, email, phone, password }`
- `POST /api/auth/login` - User authentication
  - Body: `{ email, password }`
  - Returns: JWT token

### Trips
- `GET /api/search?from=&to=` - Search available trips by source and destination
- `GET /api/trips/:id` - Get specific trip details
- `GET /api/seats/:tripId` - Get seat map and pricing for a trip

### Bookings (Require Authentication)
- `POST /api/bookings` - Create a new booking
  - Body: Trip and passenger details
- `GET /api/bookings` - List all user bookings
- `GET /api/bookings/:bookingId` - Get specific booking details
- `PUT /api/bookings/:bookingId/cancel` - Cancel a booking

### Admin Routes (`/api/admin`)
- **Users** - Manage system users
- **Trips** - Create and manage trips
- **Bookings** - View all bookings and manage
- **Refunds** - Process refund requests
- **Analytics** - View analytics and statistics
- **Reports** - Generate business reports
- **Activity Logs** - Track system activities
- **Announcements** - Create and manage announcements

## Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with configuration:
   ```env
   PORT=7000
   JWT_SECRET=your_secret_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:7000`

## Database

- **Type**: JSON-based with lowdb
- **File**: `data/db.json`
- **Auto-initialization**: Database is initialized on server startup with sample data

## Authentication

- JWT tokens are issued on successful login
- Protected routes require `Authorization: Bearer <token>` header
- Token validation handled by auth middleware

## CORS Configuration

- Frontend origin: `http://localhost:5173`
- Credentials: Enabled for cookie support

## Environment Variables

- `PORT` - Server port (default: 7000)
- `JWT_SECRET` - Secret key for JWT signing (default: fallback secret)

## Notes

- Uses lowdb for lightweight data persistence
- JSON database resets on server restart (perfect for development)
- All timestamps stored in ISO format
- Error handling includes JSON parsing validation
- 404 handler for non-existent endpoints
