import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { initDb } from './data/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Initialize Database
await initDb();

// Create a centralized API router for flexible path prefixes
const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    env: process.env.VERCEL ? 'vercel' : 'local',
    node_version: process.version
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', tripRoutes);

// Mount the API router
// 1. At /api for standard calls
app.use('/api', apiRouter);
// 2. At root for flexible/prefixed calls (like /auth, /search, etc.)
app.use(apiRouter);

// ---------------------------------------------------------
// API ROUTES CATCH-ALL
// ---------------------------------------------------------

// Unified 404 handler for any path that reaches here
app.use((req, res) => {
  const isApi = req.url.startsWith('/api') || 
                req.url.startsWith('/auth') || 
                req.url.startsWith('/bookings') || 
                req.url.startsWith('/admin') ||
                req.url.startsWith('/trips');
  
  if (isApi) {
    return res.status(404).json({ 
      error: 'API Endpoint not found', 
      path: req.originalUrl,
      method: req.method 
    });
  }
  
  // If not an API path and we are NOT on Vercel, it might be a static file request
  if (!process.env.VERCEL) {
    // Falls through to static middleware if it existed
    return res.status(404).send('Page not found');
  }
  
  // On Vercel, vercel.json handles non-API routes, so if we are here, it's a 404
  res.status(404).json({ error: 'Not found' });
});

// Global Error Handler (500)
app.use((err, req, res, _next) => {
  console.error(`[INTERNAL ERROR] ${err.stack}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// ---------------------------------------------------------
// LOCAL DEVELOPMENT ONLY: STATIC SERVING
// ---------------------------------------------------------
if (!process.env.VERCEL) {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    // Catch-all route to serve the React app across frontend routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.warn('WARNING: Frontend dist directory not found at:', frontendDistPath);
    console.warn('Local frontend serving is disabled.');
  }
}

// Start server if not running on Vercel serverless functions
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;