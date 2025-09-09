const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const { auth, isFirebaseEnabled } = require('../config/firebase');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  // Email/Password Registration
  static async register(req, res) {
    try {
      if (!isFirebaseEnabled) {
        return res.status(503).json({
          error: 'Authentication service unavailable',
          message: 'Firebase not configured. Please set up Firebase credentials in your .env file.',
          setupGuide: 'Check AUTH_SETUP.md for configuration instructions'
        });
      }

      // Validation
      await Promise.all([
        body('email').isEmail().normalizeEmail().run(req),
        body('password').isLength({ min: 6 }).run(req),
        body('displayName').optional().isLength({ min: 2 }).run(req)
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, displayName } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create user in Firebase Auth
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      });

      // Create user in Firestore
      const user = await User.create({
        email,
        displayName: displayName || email.split('@')[0],
        provider: 'email',
        isEmailVerified: false,
        firebaseUid: firebaseUser.uid
      });

      // Also persist to MongoDB if connected
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          await MongoUser.create({
            firebaseUid: firebaseUser.uid,
            email,
            displayName: displayName || email.split('@')[0],
            provider: 'email'
          });
          console.log('Saved user to MongoDB');
        }
      } catch (e) {
        console.warn('Could not save user to MongoDB:', e.message);
      }

      // Generate custom token
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role
        },
        token: customToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  // Email/Password Login
  static async login(req, res) {
    try {
      await Promise.all([
        body('email').isEmail().normalizeEmail().run(req),
        body('password').isLength({ min: 1 }).run(req)
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get user by email
      const user = await User.findByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // For email/password auth, we need to verify through Firebase
      // The client should authenticate with Firebase first, then send the ID token
      return res.status(400).json({ 
        error: 'Use Firebase client SDK for email/password authentication, then send ID token' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  // Google OAuth Login/Register
  static async googleAuth(req, res) {
    try {
      if (!isFirebaseEnabled) {
        return res.status(503).json({
          error: 'Authentication service unavailable',
          message: 'Firebase not configured. Please set up Firebase credentials in your .env file.',
          setupGuide: 'Check AUTH_SETUP.md for configuration instructions'
        });
      }

      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'Google ID token required' });
      }

      // Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { email, name, picture, sub: googleId } = payload;

      // Check if user exists
      let user = await User.findByEmail(email);

      if (!user) {
        // Create new user
        user = await User.create({
          email,
          displayName: name,
          photoURL: picture,
          provider: 'google',
          isEmailVerified: true,
          googleId
        });
      } else {
        // Update last login
        await User.update(user.id, {
          lastLoginAt: new Date(),
          photoURL: picture || user.photoURL
        });
      }

      // Create or get Firebase user
      let firebaseUser;
      try {
        firebaseUser = await auth.getUserByEmail(email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          firebaseUser = await auth.createUser({
            email,
            displayName: name,
            photoURL: picture
          });
        } else {
          throw error;
        }
      }

      // Generate custom token
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      res.json({
        message: user.provider === 'google' ? 'Logged in with Google' : 'Registered with Google',
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role
        },
        token: customToken
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: error.message || 'Google authentication failed' });
    }
  }

  // Verify Firebase ID Token (for client SDK authentication)
  static async verifyToken(req, res) {
    try {
      if (!isFirebaseEnabled) {
        return res.status(503).json({
          error: 'Authentication service unavailable',
          message: 'Firebase not configured. Please set up Firebase credentials in your .env file.',
          setupGuide: 'Check AUTH_SETUP.md for configuration instructions'
        });
      }

      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'Firebase ID token required' });
      }

      const decodedToken = await auth.verifyIdToken(idToken);
      const user = await User.findByEmail(decodedToken.email);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      // Update last login
      await User.update(user.id, { lastLoginAt: new Date() });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(403).json({ error: 'Invalid token' });
    }
  }

  // Logout (mainly for client-side token cleanup)
  static async logout(req, res) {
    try {
      // In Firebase auth, logout is handled client-side
      // We can optionally log this action
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
