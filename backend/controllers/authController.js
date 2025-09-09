const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const { auth, isFirebaseEnabled } = require('../config/firebase');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to verify Firebase credentials using REST API
const verifyFirebaseCredentials = async (email, password) => {
  try {
    const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

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

      const { email, password, displayName, ...farmerData } = req.body;

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

      // Create user in our database (MongoDB or mock) with farmer data
      const user = await User.create({
        email,
        displayName: displayName || email.split('@')[0],
        provider: 'email',
        isEmailVerified: false,
        firebaseUid: firebaseUser.uid,
        // Include farmer-specific fields
        experience: farmerData.experience || 0,
        farmSize: farmerData.farmSize || '',
        district: farmerData.district || '',
        phoneNumber: farmerData.phone || '',
        primaryCrops: farmerData.crops || [],
        language: farmerData.language || 'english',
        role: 'farmer'
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
            provider: 'email',
            // Store farmer-specific data in MongoDB
            experience: farmerData.experience || 0,
            farmSize: farmerData.farmSize || '',
            district: farmerData.district || '',
            phoneNumber: farmerData.phone || '',
            primaryCrops: farmerData.crops || [],
            language: farmerData.language || 'english',
            role: 'farmer',
            farms: farmerData.farms || []
          });
          console.log('✅ User saved to MongoDB');
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
          role: user.role,
          experience: user.experience,
          farmSize: user.farmSize,
          district: user.district,
          phoneNumber: user.phoneNumber,
          primaryCrops: user.primaryCrops,
          language: user.language
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
      if (!isFirebaseEnabled) {
        return res.status(503).json({
          error: 'Authentication service unavailable',
          message: 'Firebase not configured. Please set up Firebase credentials in your .env file.',
          setupGuide: 'Check AUTH_SETUP.md for configuration instructions'
        });
      }

      await Promise.all([
        body('email').isEmail().normalizeEmail().run(req),
        body('password').isLength({ min: 1 }).run(req)
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        // First, verify credentials with Firebase using REST API
        const firebaseAuth = await verifyFirebaseCredentials(email, password);
        
        if (!firebaseAuth.success) {
          console.error('Firebase auth failed:', firebaseAuth.error);
          return res.status(401).json({ 
            error: 'Invalid email or password',
            details: firebaseAuth.error
          });
        }

        // Get user from Firebase Admin SDK to get full user details
        const firebaseUser = await auth.getUserByEmail(email);
        
        // Check if user exists in our database
        let user = await User.findByEmail(email);
        
        if (!user) {
          // Create new user in our database if they don't exist
          user = await User.create({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || email.split('@')[0],
            provider: 'email',
            isEmailVerified: firebaseUser.emailVerified,
            firebaseUid: firebaseUser.uid
          });
          console.log('✅ User created in database');
        }

        // Update last login and ensure Firebase UID is synced
        await User.update(user.id, {
          lastLoginAt: new Date(),
          firebaseUid: firebaseUser.uid,
          displayName: firebaseUser.displayName || user.displayName
        });
        console.log('✅ User updated in database');

        // Also save to MongoDB if connected
        try {
          const mongoose = require('mongoose');
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            const MongoUser = require('../models/MongoUser');
            
            // Check if user exists in MongoDB
            let mongoUser = await MongoUser.findOne({ firebaseUid: firebaseUser.uid });
            
            if (!mongoUser) {
              // Create new user in MongoDB
              await MongoUser.create({
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || email.split('@')[0],
                provider: 'email',
                role: 'farmer',
                lastLoginAt: new Date()
              });
              console.log('✅ User saved to MongoDB');
            } else {
              // Update existing user
              await MongoUser.updateOne(
                { firebaseUid: firebaseUser.uid },
                { 
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || email.split('@')[0],
                  provider: 'email',
                  lastLoginAt: new Date()
                }
              );
              console.log('✅ User updated in MongoDB');
            }
          }
        } catch (e) {
          console.warn('Could not save user to MongoDB:', e.message);
        }

        // Generate custom token for client
        const customToken = await auth.createCustomToken(firebaseUser.uid);

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            firebaseUid: firebaseUser.uid
          },
          token: customToken
        });
        
      } catch (firebaseError) {
        console.error('Firebase auth error:', firebaseError.message);
        
        if (firebaseError.code === 'auth/user-not-found') {
          return res.status(401).json({ error: 'User not found. Please register first.' });
        }
        
        return res.status(500).json({ 
          error: 'Authentication failed',
          message: firebaseError.message 
        });
      }
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

  // Get user profile
  static async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Decode URL-encoded email if necessary
      const decodedUserId = decodeURIComponent(userId);
      
      // Get user from database - try by email first
      let user = await User.findByEmail(decodedUserId);
      
      // Also try to get from MongoDB for more complete data
      let mongoUser = null;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          mongoUser = await MongoUser.findOne({ email: decodedUserId });
        }
      } catch (e) {
        console.warn('Could not fetch from MongoDB:', e.message);
      }
      
      // If not found by email, try by ID
      if (!user && !decodedUserId.includes('@')) {
        user = await User.findById(decodedUserId);
      }
      
      if (!user) {
        // Return default profile for demo purposes if user not found
        console.warn(`User not found: ${decodedUserId}, returning default profile`);
        return res.json({
          success: true,
          user: {
            id: 'demo-user',
            email: decodedUserId,
            displayName: 'Demo Farmer',
            photoURL: null,
            role: 'farmer',
            experience: 15,
            farmSize: '3.5 acres',
            district: 'Wayanad',
            phoneNumber: '',
            primaryCrops: ['Coconut', 'Pepper', 'Cardamom'],
            cropsScanned: 12,
            questionsAsked: 8,
            daysActive: 25,
            language: 'English'
          }
        });
      }

      // Return user profile data (merge MongoDB data if available)
      const profileData = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role || 'farmer',
        
        // Use MongoDB data if available, otherwise defaults
        experience: mongoUser?.experience || user.experience || 0,
        farmSize: mongoUser?.farmSize || user.farmSize || '',
        district: mongoUser?.district || user.district || '',
        phoneNumber: mongoUser?.phoneNumber || user.phoneNumber || '',
        primaryCrops: mongoUser?.primaryCrops || user.primaryCrops || [],
        language: mongoUser?.language || user.language || 'english',
        farms: mongoUser?.farms || [],
        
        // Activity data from MongoDB
        cropsScanned: mongoUser?.cropsScanned || 0,
        questionsAsked: mongoUser?.questionsAsked || 0,
        daysActive: mongoUser?.daysActive || 0
      };
      
      res.json({
        success: true,
        user: profileData
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Determine whether the param is an email or an internal id
      let targetId = userId;
      if (userId.includes('@')) {
        const byEmail = await User.findByEmail(userId);
        if (!byEmail) {
          return res.status(404).json({ error: 'User not found' });
        }
        targetId = byEmail.id;
      }

      // Whitelist updatable fields
      const allowed = ['displayName', 'experience', 'farmSize', 'district', 'phoneNumber', 'primaryCrops', 'language', 'farms'];
      const sanitized = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(updateData, key)) {
          sanitized[key] = updateData[key];
        }
      }

      // Update in primary database
      const updatedUser = await User.update(targetId, sanitized);
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });

      // Also update in MongoDB if connected
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          await MongoUser.updateOne(
            { email: updatedUser.email },
            { 
              ...sanitized,
              updatedAt: new Date()
            },
            { upsert: false }
          );
          console.log('✅ Profile updated in MongoDB');
        }
      } catch (e) {
        console.warn('Could not update MongoDB profile:', e.message);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
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
