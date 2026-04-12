# AWT - Advanced Bus Ticketing & Booking System

A full-stack web application for bus booking and ticketing with advanced admin management capabilities.

## Project Overview

AWT (Advanced Web Technologies) is a complete bus booking platform featuring:
- User booking and ticket management
- Real-time seat selection with pricing
- Comprehensive admin dashboard
- Analytics and reporting
- Activity logging and announcements

## Architecture

```
AWT-PROJECT/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   │   ├── pages/     # Route pages (user & admin)
│   │   ├── components/# Reusable components
│   │   ├── context/   # Global state management
│   │   └── services/  # API integration
│   └── package.json
│
├── backend/           # Express.js backend API
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth & custom middleware
│   ├── data/          # Database (lowdb JSON)
│   └── package.json
│
└── README.md          # This file
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone/Extract the project**
   ```bash
   cd AWT-PROJECT
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend server runs on `http://localhost:7000`

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend app runs on `http://localhost:5173`

## Features

### 👤 User Features
- ✅ User registration and login
- ✅ Search buses by source and destination
- ✅ View trip details and pricing
- ✅ Interactive seat selection
- ✅ Checkout and booking
- ✅ Digital ticket generation
- ✅ View booking history

### 👨‍💼 Admin Features
- ✅ Admin authentication
- ✅ Dashboard with key metrics
- ✅ User management
- ✅ Trip management (create/edit/delete)
- ✅ Booking management
- ✅ Refund processing
- ✅ Analytics and insights
- ✅ Business reports
- ✅ Activity logs
- ✅ System announcements

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- React Router v6
- Context API (state management)
- CSS3

### Backend
- Express.js
- lowdb (JSON database)
- JWT (authentication)
- CORS middleware
- Dotenv (configuration)

## API Documentation

### Frontend to Backend Communication
- Base URL: `http://localhost:7000/api`
- Authentication: JWT Bearer tokens
- CORS: Enabled for `http://localhost:5173`

**Key API Categories:**
- `/auth` - User authentication
- `/search`, `/trips`, `/seats` - Trip and seat queries
- `/bookings` - Booking operations
- `/admin` - Admin management endpoints

For detailed endpoint information, see:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## Database

- **Type**: JSON-based using lowdb
- **Location**: `backend/data/db.json`
- **Persistence**: File-based storage
- **Reset**: Resets on server restart (ideal for development)

## Development Workflow

1. **Start both servers** (in separate terminals)
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Access the application**
   - User app: `http://localhost:5173`
   - Admin login: Navigate to `/admin/login`

3. **Make changes**
   - Frontend: Changes hot-reload automatically
   - Backend: May require restart for some changes

## Port Configuration

- **Frontend**: `5173` (Vite dev server)
- **Backend**: `7000` (Express server)
- **Database**: JSON file at `backend/data/db.json`

## Project Status

✅ Core booking system implemented
✅ User authentication and authorization
✅ Admin dashboard and management
✅ Real-time seat selection
✅ Booking and ticketing system
✅ Analytics and reporting

## Notes

- All data is stored in JSON format (lowdb)
- JWT is used for secure authentication
- Admin routes are protected and require authentication
- CORS is configured for local development
- Both servers must be running for full functionality


## Deployment

### Vercel (Automatic)
The project is configured for Vercel with `vercel.json` and the `api/` directory.

### Render
To deploy on Render, follow these steps in your Dashboard:

1.  **Connect your GitHub Repository**.
2.  **Environment Settings**:
    - **Runtime**: `Node`
    - **Build Command**: `npm run build`
    - **Start Command**: `npm start`
    - **Root Directory**: `.` (Repository root)
3.  **Environment Variables**:
    - `MONGO_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A secure string for tokens.
    - `FRONTEND_URL`: Your deployed frontend URL (for CORS).

## Getting Help

Refer to individual README files:
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
