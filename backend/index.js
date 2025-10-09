// index.js
require("dotenv").config({ path: __dirname + '/.env' });
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");

// Import Firebase config (keeps side-effects/init if any)
const { admin } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins (comma-separated in .env) or sensible defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

// Add Vercel deployment URL to allowed origins
allowedOrigins.push('https://ammachiai.vercel.app');

// Add Render deployment URL to allowed origins (fixing the pattern matching issue)
allowedOrigins.push('https://ammachi-ai.onrender.com');

console.log('Allowed origins:', allowedOrigins);

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      console.log('No origin header, allowing request');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    const isAllowedOrigin = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowedOrigin) {
      console.log('CORS allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocking origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Add a middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'None'}`);
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Basic routes / health checks
app.get("/", (req, res) => {
  res.json({
    message: "Ammachi AI Backend Server is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test CORS endpoint
app.post("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS is working correctly!",
    timestamp: new Date().toISOString(),
    origin: req.get('Origin')
  });
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Special route for market API testing
app.get('/test-market', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-frontend.html'));
});

// Special route for weather API testing
app.get('/test-weather', (req, res) => {
  res.status(404).json({ error: 'Test file not found' });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ammachi-ai-backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/disease');
const farmersRoutes = require('./routes/farmers');
const marketRoutes = require('./routes/market');
const weatherRoutes = require('./routes/weather');
const chatbotRoutes = require('./routes/chatbot');

// API Routes - keep them together and before error handlers
app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: "CORS Error",
      message: "CORS policy is blocking your request. Please check your origin.",
    });
  }
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// MongoDB Connection (Optional - only if MONGO_URI is provided)
async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.log("⚠️ MongoDB URI not provided. MongoDB features will be disabled.");
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ MongoDB features will be disabled.");
    return null;
  }
}

connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ammachi AI Backend server is running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;