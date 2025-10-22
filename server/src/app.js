const express = require('express');
const cors = require('cors');
const scraperRoutes = require('./routes/scraperRoutes');

// Initialize Express app
const app = express();

/**
 * Middleware Configuration
 */

// Enable CORS for all routes (allows frontend to call backend)

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://web-scrapper-rih7.onrender.com'
];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g. server-to-server, curl)
    if (!origin) return cb(null, true);
    cb(allowedOrigins.includes(origin) ? null : new Error('Not allowed by CORS'), allowedOrigins.includes(origin));
  }
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', scraperRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;