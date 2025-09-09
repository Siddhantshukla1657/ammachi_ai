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
          message: 'Firebase not configured. Please set up Firebase credentials in your .env file.'
        });
      }

      const { 
        email, 
        password, 
        displayName,
        name,
        phone,
        language,
        experience,
        farmSize,
        state,
        district,
        farms,
        crops
      } = req.body;

      const userName = displayName || name || email.split('@')[0];

      // Check if user already exists in MongoDB
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          const existingMongoUser = await MongoUser.findOne({ email });
          if (existingMongoUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
          }
        }
      } catch (e) {
        console.warn('Could not check MongoDB for existing user:', e.message);
      }

      // Check Firebase for existing user
      try {
        const existingFirebaseUser = await auth.getUserByEmail(email);
        if (existingFirebaseUser) {
          return res.status(400).json({ error: 'User already exists with this email' });
        }
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Create user in Firebase Auth
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: userName
      });

      console.log('✅ Firebase user created with UID:', firebaseUser.uid);

      // Prepare farmer data
      const farmerData = {
        firebaseUid: firebaseUser.uid,
        email,
        displayName: userName,
        provider: 'email',
        role: 'farmer',
        experience: Number(experience) || 0,
        farmSize: farmSize || '',
        district: district || '',
        phoneNumber: phone || '',
        primaryCrops: Array.isArray(crops) ? crops : (crops ? crops.split(',').map(c => c.trim()) : []),
        language: language || 'english',
        farms: Array.isArray(farms) ? farms : [],
        state: state || 'Kerala'
      };

      // Save to MongoDB (primary database)
      let mongoUser = null;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          mongoUser = await MongoUser.create(farmerData);
          console.log('✅ User saved to MongoDB with ID:', mongoUser._id);
        }
      } catch (e) {
        console.error('Failed to save user to MongoDB:', e.message);
        try {
          await auth.deleteUser(firebaseUser.uid);
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase user:', cleanupError.message);
        }
        return res.status(500).json({ error: 'Failed to save user data. Please try again.' });
      }

      // Generate custom token
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: mongoUser?._id || firebaseUser.uid,
          email: farmerData.email,
          displayName: farmerData.displayName,
          role: farmerData.role,
          experience: farmerData.experience,
          farmSize: farmerData.farmSize,
          district: farmerData.district,
          phoneNumber: farmerData.phoneNumber,
          primaryCrops: farmerData.primaryCrops,
          language: farmerData.language,
          farms: farmerData.farms,
          firebaseUid: firebaseUser.uid
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
          message: 'Firebase not configured.'
        });
      }

      const { email, password } = req.body;

      // Verify credentials with Firebase
      const firebaseAuth = await verifyFirebaseCredentials(email, password);
      
      if (!firebaseAuth.success) {
        return res.status(401).json({ 
          error: 'Invalid email or password'
        });
      }

      // Get user from Firebase Admin SDK
      const firebaseUser = await auth.getUserByEmail(email);
      
      // Get user data from MongoDB
      let mongoUser = null;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          mongoUser = await MongoUser.findOne({ email: email });
          
          if (mongoUser) {
            await MongoUser.updateOne(
              { _id: mongoUser._id },
              { lastLoginAt: new Date() }
            );
            console.log('✅ User login updated in MongoDB');
          }
        }
      } catch (e) {
        console.warn('Could not fetch/update user in MongoDB:', e.message);
      }

      // Generate custom token
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      // Prepare user response
      const userData = {
        id: mongoUser?._id || firebaseUser.uid,
        email: email,
        displayName: mongoUser?.displayName || firebaseUser.displayName || email.split('@')[0],
        role: mongoUser?.role || 'farmer',
        firebaseUid: firebaseUser.uid,
        experience: mongoUser?.experience || 0,
        farmSize: mongoUser?.farmSize || '',
        district: mongoUser?.district || '',
        phoneNumber: mongoUser?.phoneNumber || '',
        primaryCrops: mongoUser?.primaryCrops || [],
        language: mongoUser?.language || 'english',
        farms: mongoUser?.farms || []
      };

      res.json({
        message: 'Login successful',
        user: userData,
        token: customToken
      });
        
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const decodedUserId = decodeURIComponent(userId);
      
      // Try to get from MongoDB first
      let mongoUser = null;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          if (decodedUserId.includes('@')) {
            mongoUser = await MongoUser.findOne({ email: decodedUserId });
          } else {
            mongoUser = await MongoUser.findOne({ firebaseUid: decodedUserId }) || 
                       await MongoUser.findById(decodedUserId).catch(() => null);
          }
        }
      } catch (e) {
        console.warn('Could not fetch from MongoDB:', e.message);
      }
      
      if (!mongoUser) {
        return res.json({
          success: true,
          user: {
            id: 'demo-user',
            email: decodedUserId.includes('@') ? decodedUserId : 'demo@example.com',
            displayName: 'Demo Farmer',
            role: 'farmer',
            experience: 15,
            farmSize: '3.5 acres',
            district: 'Wayanad',
            phoneNumber: '+91 9876543210',
            primaryCrops: ['Coconut', 'Pepper', 'Cardamom'],
            language: 'english'
          }
        });
      }

      const profileData = {
        id: mongoUser._id,
        email: mongoUser.email,
        displayName: mongoUser.displayName,
        role: mongoUser.role || 'farmer',
        firebaseUid: mongoUser.firebaseUid,
        experience: mongoUser.experience || 0,
        farmSize: mongoUser.farmSize || '',
        district: mongoUser.district || '',
        phoneNumber: mongoUser.phoneNumber || '',
        primaryCrops: mongoUser.primaryCrops || [],
        language: mongoUser.language || 'english',
        farms: mongoUser.farms || [],
        cropsScanned: mongoUser.cropsScanned || 0,
        questionsAsked: mongoUser.questionsAsked || 0,
        daysActive: mongoUser.daysActive || 0
      };
      
      res.json({
        success: true,
        user: profileData
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
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

      const decodedUserId = decodeURIComponent(userId);
      
      // Whitelist updatable fields
      const allowed = ['displayName', 'experience', 'farmSize', 'district', 'phoneNumber', 'primaryCrops', 'language', 'farms'];
      const sanitized = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(updateData, key)) {
          sanitized[key] = updateData[key];
        }
      }

      // Update in MongoDB
      let mongoUpdated = false;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          const query = decodedUserId.includes('@') 
            ? { email: decodedUserId }
            : { firebaseUid: decodedUserId };
          
          const result = await MongoUser.updateOne(
            query,
            { ...sanitized, updatedAt: new Date() }
          );
          
          if (result.matchedCount > 0) {
            mongoUpdated = true;
            console.log('✅ Profile updated in MongoDB');
          }
        }
      } catch (e) {
        console.warn('Could not update MongoDB profile:', e.message);
      }

      if (!mongoUpdated) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: { ...updateData, ...sanitized }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }
}

module.exports = AuthController;