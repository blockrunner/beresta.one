#!/usr/bin/env node

/**
 * Production server for Beresta Website
 * Serves static files and API endpoints
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist (built frontend)
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Serve additional static files
app.use('/img', express.static(path.join(__dirname, 'img'), { maxAge: '1y' }));
app.use('/css', express.static(path.join(__dirname, 'css'), { maxAge: '1h' }));
app.use('/js', express.static(path.join(__dirname, 'js'), { maxAge: '1h' }));
app.use('/shared', express.static(path.join(__dirname, 'shared'), { maxAge: '1y' }));
app.use('/components', express.static(path.join(__dirname, 'components'), { maxAge: '1h' }));
app.use('/locales', express.static(path.join(__dirname, 'locales'), { maxAge: '1h' }));

// API routes
app.use('/api', require('./app/api/server.js'));

// Clean URLs - handle /page/ requests
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const pagePath = path.join(__dirname, 'pages', page, 'index.html');
  
  // Check if page exists
  if (require('fs').existsSync(pagePath)) {
    res.sendFile(pagePath);
  } else {
    // Try to serve from dist
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Handle root and other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Beresta server running on http://${HOST}:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
