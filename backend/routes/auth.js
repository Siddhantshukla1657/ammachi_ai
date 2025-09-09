const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleAuth);
router.post('/verify-token', AuthController.verifyToken);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);

// Profile routes
router.get('/profile/:userId', AuthController.getProfile);
router.put('/profile/:userId', AuthController.updateProfile);

// Example protected route
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

// Test endpoint to verify database connections
router.get('/test', async (req, res) => {
  try {
    const { isFirebaseEnabled } = require('../config/firebase');
    const mongoose = require('mongoose');
    
    const status = {
      firebase: isFirebaseEnabled ? 'Connected' : 'Not configured',
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      message: 'Database connection status',
      ...status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;