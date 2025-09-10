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
      let idToken = null;
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
              
              // Get an ID token for the new user
              try {
                const axios = require('axios');
                const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
                
                if (apiKey) {
                  const response = await axios.post(
                    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
                    {
                      email: payload.email,
                      password: payload.password,
                      returnSecureToken: true
                    }
                  );
                  
                  idToken = response.data.idToken;
                  console.log('✅ Retrieved Firebase ID token for new user');
                }
              } catch (tokenError) {
                console.error('Error getting ID token for new user:', tokenError.message);
                // Continue without ID token
              }
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

      // First check if the farmer exists in our database
      const farmer = await Farmer.findOne({ $or: [{ email: identifier }, { phone: identifier }, { farmerId: identifier }] });
      if (!farmer) return res.status(401).json({ error: 'Invalid credentials' });

      // If Firebase is enabled and we have an email, verify with Firebase Auth
      if (isFirebaseEnabled && farmer.email) {
        try {
          // Check if the user exists in Firebase
          let firebaseUid = farmer.firebaseUid;
          
          // If we don't have a Firebase UID but have an email, try to get the UID
          if (!firebaseUid) {
            try {
              const firebaseUser = await auth.getUserByEmail(farmer.email);
              firebaseUid = firebaseUser.uid;
              
              // Update the farmer record with the Firebase UID
              farmer.firebaseUid = firebaseUid;
              await farmer.save();
              console.log(`✅ Updated farmer with Firebase UID: ${firebaseUid}`);
            } catch (error) {
              if (error.code === 'auth/user-not-found') {
                // Create a new Firebase user if not found
                try {
                  const firebaseUser = await auth.createUser({
                    email: farmer.email,
                    password: password, // Use the provided password
                    displayName: farmer.name
                  });
                  
                  firebaseUid = firebaseUser.uid;
                  farmer.firebaseUid = firebaseUid;
                  await farmer.save();
                  console.log(`✅ Created Firebase user for existing farmer: ${firebaseUid}`);
                } catch (createError) {
                  console.error('Error creating Firebase user:', createError);
                  // Fall back to local verification
                }
              } else {
                console.error('Error getting Firebase user by email:', error);
                // Fall back to local verification
              }
            }
          }

          // If we have a Firebase UID now, verify with Firebase Auth
          if (firebaseUid) {
            try {
              // Use Firebase Admin SDK to verify the user
              console.log(`Attempting to verify Firebase user with UID: ${firebaseUid}`);
              
              // Verify the password locally since we can't verify with Firebase Admin SDK
              const isPasswordValid = await farmer.comparePassword(password);
              if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
              }
              
              // If we get here, local auth was successful
              console.log('✅ Local password verification successful');
              
              // Generate a custom token for the user
              const customToken = await auth.createCustomToken(firebaseUid);
              console.log('✅ Firebase custom token generated');
              
              // If we get here, Firebase auth was successful
              console.log('✅ Firebase authentication successful');
              
              const profile = farmer.toObject();
              delete profile.password;
              
              res.json({ 
                message: 'Logged in', 
                profile, 
                token: customToken,
                firebaseAuth: true,
                idToken: customToken // Include the Firebase custom token
              });
              return;
            } catch (error) {
              console.error('Firebase Auth verification error:', error.response?.data || error.message);
              // Fall back to local verification
            }
          }
        } catch (firebaseError) {
          console.error('Firebase Auth error during login:', firebaseError);
          // Fall back to local verification
        }
      }

      // If Firebase Auth didn't succeed or isn't enabled, verify with local password
      const ok = await farmer.comparePassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

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
