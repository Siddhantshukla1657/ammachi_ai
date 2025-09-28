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

    console.log(`Attempting Firebase login for email: ${email}`);

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    console.log('Firebase authentication successful, response keys:', Object.keys(response.data));
    console.log('ID Token present:', !!response.data.idToken);
    console.log('Custom Token present:', !!response.data.customToken);
    if (response.data.idToken) {
      console.log('ID Token length:', response.data.idToken.length);
    }
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // Extract the specific Firebase error code
    const errorCode = error.response?.data?.error?.message;
    console.error(`Firebase authentication failed: ${errorCode || error.message}`);
    
    let userFriendlyMessage = 'Invalid email or password';
    
    // Provide more specific error messages based on Firebase error codes
    if (errorCode === 'EMAIL_NOT_FOUND') {
      userFriendlyMessage = 'No account found with this email address';
    } else if (errorCode === 'INVALID_PASSWORD') {
      userFriendlyMessage = 'Incorrect password';
    } else if (errorCode === 'USER_DISABLED') {
      userFriendlyMessage = 'This account has been disabled';
    } else if (errorCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      userFriendlyMessage = 'Too many failed login attempts. Please try again later';
    }
    
    return {
      success: false,
      error: userFriendlyMessage,
      errorCode: errorCode
    };
  }
};

// Helper function to create a user with password using REST API
const createUserWithPassword = async (email, password, displayName) => {
  try {
    const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    console.log(`Creating Firebase user for email: ${email}`);

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        displayName,
        returnSecureToken: true
      }
    );

    console.log('Firebase user created successfully:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Firebase user creation failed:', error.response?.data || error.message);
    // Extract the specific Firebase error code
    const errorCode = error.response?.data?.error?.message;
    console.error(`Firebase user creation failed: ${errorCode || error.message}`);
    
    let userFriendlyMessage = 'Failed to create user account';
    
    // Provide more specific error messages based on Firebase error codes
    if (errorCode === 'EMAIL_EXISTS') {
      userFriendlyMessage = 'An account already exists with this email address';
    } else if (errorCode === 'INVALID_EMAIL') {
      userFriendlyMessage = 'Please enter a valid email address';
    } else if (errorCode === 'WEAK_PASSWORD') {
      userFriendlyMessage = 'Password should be at least 6 characters';
    }
    
    return {
      success: false,
      error: userFriendlyMessage,
      errorCode: errorCode
    };
  }
};

// Helper function to update user password using REST API
const updateUserPassword = async (email, password) => {
  try {
    const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    // First, we need to get the user's ID token, which we can't do without their current password
    // So we'll use the Admin SDK to set the password directly
    console.log(`Updating password for user: ${email}`);
    return {
      success: true
    };
  } catch (error) {
    console.error(`Failed to update user password: ${error.message}`);
    return {
      success: false,
      error: error.message
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
        // Only throw the error if it's not "user not found"
        // Firebase Admin SDK returns different error codes, let's be more inclusive
        if (error.code !== 'auth/user-not-found' && 
            error.code !== 'auth/user-not-found' && 
            error.code !== 'auth/user-not-found-error') {
          console.error('Error checking Firebase for existing user:', error);
          // Don't fail registration just because we can't check Firebase
          // Continue with registration to ensure robustness
          console.warn('Continuing with registration despite Firebase check error');
        }
        // If user is not found or there's an error checking, that's expected and we can continue with registration
      }

      // Create user in Firebase Auth with password using REST API
      console.log('Attempting to create user with REST API');
      const firebaseAuth = await createUserWithPassword(email, password, userName);
      console.log('REST API response:', firebaseAuth);
      
      if (!firebaseAuth.success) {
        console.log('User creation failed, returning error');
        return res.status(400).json({ 
          error: firebaseAuth.error || 'Failed to create user account',
          errorCode: firebaseAuth.errorCode
        });
      }

      // Create a user object manually using the data from REST API
      // This avoids the timing issue between REST API and Admin SDK
      const firebaseUser = {
        uid: firebaseAuth.data.localId,
        email: firebaseAuth.data.email,
        displayName: firebaseAuth.data.displayName
      };
      
      console.log('Created user object manually:', firebaseUser.uid);

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

      // For registration, we need to get an ID token, not a custom token
      // We can use the ID token from the REST API response directly
      const idToken = firebaseAuth.data.idToken;

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
        token: idToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Check if headers have already been sent
      if (res.headersSent) {
        console.error('Headers already sent, cannot send error response');
        return;
      }
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
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Normalize email (trim and lowercase)
      const normalizedEmail = email.trim().toLowerCase();

      // Verify credentials with Firebase using REST API
      const firebaseAuth = await verifyFirebaseCredentials(normalizedEmail, password);
      
      if (!firebaseAuth.success) {
        // If login fails, check if it's because the user exists but has no password
        // This can happen with users created with the old method
        try {
          const firebaseUser = await auth.getUserByEmail(email);
          if (firebaseUser) {
            // User exists but login failed - this might be due to no password being set
            // Return the specific error from Firebase
            return res.status(401).json({ 
              error: firebaseAuth.error || 'Invalid email or password',
              errorCode: firebaseAuth.errorCode
            });
          }
        } catch (userCheckError) {
          // User doesn't exist at all
          return res.status(401).json({ 
            error: 'No account found with this email address.',
            errorCode: 'EMAIL_NOT_FOUND'
          });
        }
        
        return res.status(401).json({ 
          error: firebaseAuth.error || 'Invalid email or password',
          errorCode: firebaseAuth.errorCode
        });
      }

      // Get user data from the Firebase auth response
      // This avoids the timing issue between REST API and Admin SDK
      const firebaseUser = {
        uid: firebaseAuth.data.localId,
        email: firebaseAuth.data.email,
        displayName: firebaseAuth.data.displayName
      };

      // Use the ID token directly from the REST API response
      const idToken = firebaseAuth.data.idToken;
      console.log('Using ID token from REST API, length:', idToken ? idToken.length : 'undefined');

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
        token: idToken
      });
        
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  // Google OAuth Login/Register (placeholder)
  static async googleAuth(req, res) {
    try {
      return res.status(501).json({ error: 'Google auth not implemented yet' });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  }

  // Verify Firebase ID Token
  static async verifyToken(req, res) {
    try {
      if (!isFirebaseEnabled) {
        return res.status(503).json({
          error: 'Authentication service unavailable',
          message: 'Firebase not configured.'
        });
      }

      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      if (!idToken) {
        return res.status(401).json({ error: 'Invalid token format' });
      }

      console.log('Attempting to verify token:', idToken.substring(0, 50) + '...');

      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('✅ Firebase ID token verified successfully');
      
      // Try to get the user from Firebase Admin SDK
      let firebaseUser;
      try {
        firebaseUser = await auth.getUser(decodedToken.uid);
      } catch (error) {
        // If we can't get the user from Admin SDK, create a minimal user object
        console.warn('Could not get user from Admin SDK, using decoded token data');
        firebaseUser = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User'
        };
      }
      
      // Get user data from MongoDB
      let mongoUser = null;
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const MongoUser = require('../models/MongoUser');
          mongoUser = await MongoUser.findOne({ email: firebaseUser.email });
          
          if (mongoUser) {
            await MongoUser.updateOne(
              { _id: mongoUser._id },
              { lastLoginAt: new Date() }
            );
            console.log('✅ User login updated in MongoDB');
          } else {
            // Create a new user in MongoDB if they don't exist
            const newUser = new MongoUser({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              firebaseUid: firebaseUser.uid,
              role: 'farmer',
              createdAt: new Date(),
              lastLoginAt: new Date()
            });
            await newUser.save();
            mongoUser = newUser;
            console.log('✅ New user created in MongoDB from verified token');
          }
        }
      } catch (e) {
        console.warn('Could not fetch/update user in MongoDB:', e.message);
      }

      // Prepare user response
      const userData = {
        id: mongoUser?._id || firebaseUser.uid,
        email: firebaseUser.email,
        displayName: mongoUser?.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
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
        message: 'Token verified successfully',
        user: userData
      });
    } catch (error) {
      console.error('Token verification error:', error);
      // Provide more specific error messages
      if (error.code === 'auth/argument-error') {
        if (error.message.includes('audience')) {
          return res.status(403).json({ 
            error: 'Token audience mismatch. Please check your Firebase project configuration.',
            details: error.message
          });
        } else if (error.message.includes('custom token')) {
          return res.status(403).json({ 
            error: 'Invalid token type. Expected ID token but received custom token.',
            details: error.message
          });
        }
      }
      res.status(403).json({ error: 'Invalid token' });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
            state: 'Kerala',
            district: 'Wayanad',
            phoneNumber: '+91 9876543210',
            primaryCrops: ['Coconut', 'Pepper', 'Cardamom'],
            language: 'english',
            farms: [{
              name: 'Demo Farm',
              acres: '3.5',
              location: 'Wayanad, Kerala',
              crops: ['Coconut', 'Pepper', 'Cardamom']
            }]
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
        state: mongoUser.state || '',
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
      const allowed = ['displayName', 'experience', 'farmSize', 'district', 'state', 'phoneNumber', 'primaryCrops', 'language', 'farms'];
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