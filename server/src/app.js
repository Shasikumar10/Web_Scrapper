const express = require('express');
const cors = require('cors');
const scraperRoutes = require('./routes/scraperRoutes');

// Initialize Express app
const app = express();

/**
 * 🌐 CORS Configuration
 *
 * - Allows frontend requests to access the backend.
 * - In production, restrict origins for security.
 * - For local development, allows localhost.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://web-scrapper-1-qz8d.onrender.com'
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like curl or server-to-server)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    } else {
      return cb(new Error('Not allowed by CORS'));
    }
  }
}));

// 🔹 Optional: Uncomment below line for testing (use ONLY in local testing)
// app.use(cors());

/**
 * 🧩 Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

/**
 * 🚀 Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use('/api', scraperRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * ⚠️ Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
