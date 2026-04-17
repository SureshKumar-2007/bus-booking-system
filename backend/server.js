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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

// Error handling middleware for JSON parsing errors
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Catch-all 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API Endpoint not found', 
    path: req.originalUrl,
    method: req.method 
  });
});

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(frontendDistPath, 'index.html');

console.log(`[Diagnostic] Frontend Dist Path: ${frontendDistPath}`);
console.log(`[Diagnostic] Dist Directory Exists: ${fs.existsSync(frontendDistPath)}`);

if (!fs.existsSync(frontendDistPath) && !process.env.VERCEL) {
  console.log('Frontend dist directory not found. Attempting to build frontend...');
  try {
    const { execSync } = await import('child_process');
    const frontendPath = path.join(__dirname, '../frontend');
    console.log(`Navigating to ${frontendPath} and running build...`);
    execSync('npm install --include=dev && npm run build', { cwd: frontendPath, stdio: 'inherit' });
    console.log('Frontend build successful.');
  } catch (error) {
    console.error('Failed to build frontend:', error.message);
  }
}

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else {
  console.warn('WARNING: Frontend dist directory not found. Frontend will not be served.');
}

// Catch-all route to serve the React app across frontend routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not built or index.html missing',
      diagnostic: {
        dist_path: frontendDistPath,
        index_path: indexHtmlPath,
        exists: fs.existsSync(indexHtmlPath)
      }
    });
  }
});

// Start server if not running on Vercel serverless functions
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;