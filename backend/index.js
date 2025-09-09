// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");

// Import Firebase config (keeps side-effects/init if any)
const { admin } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins (comma-separated in .env) or sensible defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Basic routes / health checks
app.get("/", (req, res) => {
  res.json({
    message: "Ammachi AI Backend Server is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ammachi-ai-backend",
    timestamp: new Date().toISOString(),
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/disease');
const farmersRoutes = require('./routes/farmers');

// API Routes - keep them together and before error handlers
app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/farmers', farmersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

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
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.warn("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ MongoDB features will be disabled.");
  }
}

connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ammachi AI Backend server is running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
