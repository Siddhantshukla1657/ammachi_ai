const jwt = require('jsonwebtoken');
const { auth, isFirebaseEnabled } = require('../config/firebase');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // First try to verify as a Firebase token if Firebase is enabled
    if (isFirebaseEnabled) {
      try {
        // Verify Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        console.log('✅ Firebase token verified successfully');
        
        // Try to find user in MongoDB
        let user = null;
        
        try {
          const mongoose = require('mongoose');
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            // First try MongoUser model (used by authController)
            const MongoUser = require('../models/MongoUser');
            user = await MongoUser.findOne({ email: decodedToken.email });
            
            if (!user) {
              // If not found, try Farmer model (used by farmerController)
              const Farmer = require('../models/Farmer');
              user = await Farmer.findOne({ email: decodedToken.email });
            }
          }
        } catch (dbError) {
          console.warn('Error finding user in MongoDB:', dbError.message);
        }
        
        // If we couldn't find the user in MongoDB, create a minimal user object
        if (!user) {
          user = {
            email: decodedToken.email,
            displayName: decodedToken.name || decodedToken.email.split('@')[0],
            role: 'farmer',
            firebaseUid: decodedToken.uid
          };
        }
        
        req.user = user;
        req.firebaseUser = decodedToken;
        return next();
      } catch (firebaseError) {
        // If Firebase token verification fails, try JWT
        console.log('Firebase token verification failed, trying JWT:', firebaseError.message);
      }
    }
    
    // If Firebase is not enabled or Firebase verification failed, try JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find user in MongoDB
      let user = null;
      
      try {
        if (decoded.id) {
          const mongoose = require('mongoose');
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            // First try MongoUser model
            const MongoUser = require('../models/MongoUser');
            user = await MongoUser.findById(decoded.id);
            
            if (!user && decoded.email) {
              user = await MongoUser.findOne({ email: decoded.email });
            }
            
            if (!user) {
              // If not found, try Farmer model
              const Farmer = require('../models/Farmer');
              user = await Farmer.findById(decoded.id);
              
              if (!user && decoded.email) {
                user = await Farmer.findOne({ email: decoded.email });
              }
            }
          }
        }
      } catch (dbError) {
        console.warn('Error finding user in MongoDB:', dbError.message);
      }
      
      // If we couldn't find the user in MongoDB, create a minimal user object from JWT
      if (!user) {
        user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'farmer',
          firebaseUid: decoded.firebaseUid
        };
      }
      
      req.user = user;
      return next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  generateToken,
  requireRole
};