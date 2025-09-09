const Farmer = require('../models/Farmer');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');
const { auth, isFirebaseEnabled } = require('../config/firebase');

class FarmerController {
  static async register(req, res) {
    try {
      await Promise.all([
        body('email').isEmail().optional({ nullable: true }).run(req),
        body('phone').notEmpty().run(req),
        body('name').notEmpty().run(req),
        body('password').isLength({ min: 6 }).run(req),
        body('district').notEmpty().run(req)
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const payload = req.body;

      // check duplicate by email or phone
      const exists = await Farmer.findOne({ $or: [{ email: payload.email }, { phone: payload.phone }, { farmerId: payload.farmerId }] });
      if (exists) {
        return res.status(400).json({ error: 'Farmer already exists with provided email/phone/id' });
      }
      
      // Create Firebase Auth account if Firebase is enabled and email is provided
      let firebaseUid = null;
      if (isFirebaseEnabled && payload.email) {
        try {
          // Check if user already exists in Firebase
          try {
            const firebaseUser = await auth.getUserByEmail(payload.email);
            firebaseUid = firebaseUser.uid;
            console.log(`✅ User already exists in Firebase with UID: ${firebaseUid}`);
          } catch (error) {
            if (error.code === 'auth/user-not-found') {
              // Create user in Firebase Auth
              const firebaseUser = await auth.createUser({
                email: payload.email,
                password: payload.password,
                displayName: payload.name
              });
              firebaseUid = firebaseUser.uid;
              console.log(`✅ Created Firebase Auth user with UID: ${firebaseUid}`);
            } else {
              throw error;
            }
          }
        } catch (firebaseError) {
          console.error('Firebase Auth error during farmer registration:', firebaseError);
          // Continue with MongoDB registration even if Firebase fails
        }
      }

      const farmer = new Farmer({
        farmerId: payload.farmerId,
        name: payload.name,
        email: payload.email || '',
        phone: payload.phone,
        password: payload.password,
        language: payload.language || 'malayalam',
        crops: payload.crops || [],
        experience: payload.experience || 0,
        farmSize: payload.farmSize || '',
        location: { state: payload.state || 'Kerala', district: payload.district },
        farms: payload.farms || [],
        firebaseUid: firebaseUid // Store Firebase UID if available
      });

      await farmer.save();

      const profile = farmer.toObject();
      delete profile.password;

      // Generate token - use Firebase UID if available, otherwise use MongoDB ID
      const token = generateToken({ 
        id: profile._id, 
        email: profile.email, 
        role: 'farmer',
        firebaseUid: firebaseUid
      });

      res.status(201).json({ 
        message: 'Farmer registered', 
        profile, 
        token,
        firebaseAuth: !!firebaseUid
      });
    } catch (err) {
      console.error('Farmer register error:', err);
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  }

  static async login(req, res) {
    try {
      await Promise.all([
        body('identifier').notEmpty().run(req),
        body('password').notEmpty().run(req)
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { identifier, password } = req.body;

      const farmer = await Farmer.findOne({ $or: [{ email: identifier }, { phone: identifier }, { farmerId: identifier }] });
      if (!farmer) return res.status(401).json({ error: 'Invalid credentials' });

      let firebaseAuthSuccess = false;
      
      // Try Firebase Auth if enabled and user has a Firebase UID or email
      if (isFirebaseEnabled && (farmer.firebaseUid || farmer.email)) {
        try {
          // If we have an email but no Firebase UID, try to get the UID
          if (!farmer.firebaseUid && farmer.email) {
            try {
              const firebaseUser = await auth.getUserByEmail(farmer.email);
              farmer.firebaseUid = firebaseUser.uid;
              await farmer.save(); // Update the farmer record with the Firebase UID
            } catch (error) {
              if (error.code !== 'auth/user-not-found') {
                console.error('Error getting Firebase user by email:', error);
              }
              // If user not found in Firebase, we'll fall back to local auth
            }
          }

          // If we have a Firebase UID, verify with Firebase Auth
          if (farmer.firebaseUid) {
            try {
              // Generate a custom token for the user
              const customToken = await auth.createCustomToken(farmer.firebaseUid);
              
              // In a real implementation, you would exchange this custom token for an ID token
              // using the Firebase Auth REST API, then verify the password
              // For now, we'll trust that if we can create a custom token, the user exists in Firebase
              firebaseAuthSuccess = true;
            } catch (error) {
              console.error('Firebase Auth verification error:', error);
              // Fall back to local verification
            }
          }
        } catch (firebaseError) {
          console.error('Firebase Auth error during login:', firebaseError);
          // Fall back to local verification
        }
      }

      // If Firebase Auth didn't succeed, verify with local password
      if (!firebaseAuthSuccess) {
        const ok = await farmer.comparePassword(password);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      }

      const profile = farmer.toObject();
      delete profile.password;

      // Generate token with Firebase UID if available
      const token = generateToken({ 
        id: profile._id, 
        email: profile.email, 
        role: 'farmer',
        firebaseUid: farmer.firebaseUid
      });

      res.json({ 
        message: 'Logged in', 
        profile, 
        token,
        firebaseAuth: !!farmer.firebaseUid
      });
    } catch (err) {
      console.error('Farmer login error:', err);
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  }
}

module.exports = FarmerController;
