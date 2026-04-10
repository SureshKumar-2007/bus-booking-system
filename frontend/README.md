# AWT Frontend - Bus Booking Application

A modern React + Vite based frontend for an advanced bus booking and ticketing system with comprehensive admin management features.

## Features

### User Features
- **Home Page** - Browse available trips and promotions
- **Trip Search** - Search for trips by source and destination
- **Trip Details** - View detailed information about specific trips
- **Seat Selection** - Interactive seat map with live pricing
- **Checkout** - Complete booking with passenger details
- **Ticket Generation** - Digital ticket with booking confirmation
- **User Authentication** - Login and registration system
- **About Page** - Information about the platform

### Admin Features
- **Admin Dashboard** - Overview of key metrics and statistics
- **User Management** - View and manage registered users
- **Trip Management** - Create, update, and manage bus trips
- **Booking Management** - View and manage all bookings
- **Refund Processing** - Handle refund requests
- **Analytics** - Detailed analytics on bookings and revenue
- **Reports** - Generate custom business reports
- **Activity Logs** - Track all system activities
- **Announcements** - Post announcements for users
- **Admin Authentication** - Secure admin login

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool with HMR
- **React Router v6** - Client-side routing
- **Context API** - State management
- **CSS** - Styling

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, Footer)
├── pages/           # Page components for all routes
├── context/         # React Context for global state
├── services/        # API service calls
└── assets/          # Images and static files
```

## Setup & Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The application will be available at `http://localhost:5173`

## Environment Configuration

- Frontend runs on `http://localhost:5173`
- Backend API at `http://localhost:7000`
- CORS configured for backend communication

## API Integration

All API calls are handled through [src/services/api.js](src/services/api.js) which connects to the backend server running on port 7000.

## Notes

- Uses React Context for state management
- Responsive design with CSS modules
- ESLint configured for code quality
- Vite provides fast HMR during development
