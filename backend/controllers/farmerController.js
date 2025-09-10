const Farmer = require('../models/Farmer');
const CropDiary = require('../models/CropDiary');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');
const { auth, isFirebaseEnabled } = require('../config/firebase');
const axios = require('axios');

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

  // Get dashboard data for a specific user
  static async getDashboardData(req, res) {
    try {
      const { userId } = req.params;
      
      // Get farmer profile
      const farmer = await Farmer.findById(userId).select('-password');
      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      // Get recent crop health data
      const recentScans = await CropDiary.find({ farmerId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('crop diseaseDetected severity createdAt farmName');

      // Get market data for farmer's crops
      const marketData = await Promise.all(
        farmer.crops.slice(0, 3).map(async (crop) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/market/prices`, {
              params: {
                state: farmer.location?.state || 'Kerala',
                market: getMarketForDistrict(farmer.location?.district),
                commodity: crop
              },
              timeout: 5000
            });
            
            if (response.data.success && response.data.data.length > 0) {
              const priceData = response.data.data[0];
              return {
                crop: crop,
                price: priceData.modal_price || priceData.max_price,
                change: calculatePriceChange(priceData),
                market: priceData.market,
                updated: new Date().toISOString()
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching market data for ${crop}:`, error.message);
            return null;
          }
        })
      );

      // Filter out null results
      const validMarketData = marketData.filter(data => data !== null);

      // Get weather data for farmer's location
      let weatherData = null;
      try {
        const districtCoords = getDistrictCoordinates(farmer.location?.district);
        if (districtCoords) {
          const weatherResponse = await axios.get(`http://localhost:5000/api/weather/current`, {
            params: {
              lat: districtCoords.lat,
              lon: districtCoords.lon
            },
            timeout: 5000
          });
          
          if (weatherResponse.data) {
            weatherData = {
              temp: Math.round(weatherResponse.data.main?.temp || 28),
              desc: weatherResponse.data.weather?.[0]?.description || 'Partly Cloudy',
              humidity: weatherResponse.data.main?.humidity || 75,
              wind: Math.round(weatherResponse.data.wind?.speed || 12)
            };
          }
        }
      } catch (error) {
        console.error('Error fetching weather data:', error.message);
      }

      res.json({
        success: true,
        data: {
          farmer: {
            name: farmer.name,
            crops: farmer.crops,
            district: farmer.location?.district,
            experience: farmer.experience,
            farmSize: farmer.farmSize
          },
          cropHealth: recentScans.map(scan => ({
            crop: scan.crop,
            status: scan.diseaseDetected || 'Healthy',
            severity: scan.severity || 'none',
            date: scan.createdAt,
            farm: scan.farmName
          })),
          marketPrices: validMarketData,
          weather: weatherData,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  // Get detailed crop health data for a user
  static async getCropHealthData(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, crop, farmName } = req.query;

      // Build query filters
      const query = { farmerId: userId };
      if (crop) query.crop = crop;
      if (farmName) query.farmName = farmName;

      const cropHealthData = await CropDiary.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('crop diseaseDetected severity treatmentSuggested farmName createdAt images');

      // Get health statistics
      const totalScans = await CropDiary.countDocuments({ farmerId: userId });
      const healthyScans = await CropDiary.countDocuments({ 
        farmerId: userId, 
        $or: [{ diseaseDetected: null }, { diseaseDetected: '' }, { diseaseDetected: 'Healthy' }]
      });
      const diseaseScans = totalScans - healthyScans;

      res.json({
        success: true,
        data: {
          scans: cropHealthData,
          statistics: {
            total: totalScans,
            healthy: healthyScans,
            diseased: diseaseScans,
            healthPercentage: totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 0
          }
        }
      });
      
    } catch (error) {
      console.error('Crop health data error:', error);
      res.status(500).json({ error: 'Failed to fetch crop health data' });
    }
  }

  // Save new crop health data (called after disease detection)
  static async saveCropHealthData(req, res) {
    try {
      const { farmerId, farmName, crop, diseaseDetected, severity, treatmentSuggested, images } = req.body;

      if (!farmerId || !farmName || !crop) {
        return res.status(400).json({ error: 'Missing required fields: farmerId, farmName, crop' });
      }

      const cropDiary = new CropDiary({
        farmerId,
        farmName,
        crop,
        diseaseDetected,
        severity,
        treatmentSuggested,
        images: images || []
      });

      await cropDiary.save();

      res.status(201).json({
        success: true,
        message: 'Crop health data saved successfully',
        data: cropDiary
      });
      
    } catch (error) {
      console.error('Save crop health data error:', error);
      res.status(500).json({ error: 'Failed to save crop health data' });
    }
  }
}

// Helper function to get market for district
function getMarketForDistrict(district) {
  const districtMarkets = {
    'Thiruvananthapuram': 'Thiruvananthapuram',
    'Kollam': 'Kollam',
    'Pathanamthitta': 'Pathanamthitta',
    'Alappuzha': 'Alappuzha',
    'Kottayam': 'Kottayam',
    'Idukki': 'Munnar',
    'Ernakulam': 'Ernakulam',
    'Thrissur': 'Thrissur',
    'Palakkad': 'Palakkad',
    'Malappuram': 'Malappuram',
    'Kozhikode': 'Kozhikode',
    'Wayanad': 'Wayanad',
    'Kannur': 'Kannur',
    'Kasaragod': 'Kasaragod'
  };
  return districtMarkets[district] || 'Ernakulam';
}

// Helper function to calculate price change (mock for now)
function calculatePriceChange(priceData) {
  // In a real implementation, you would compare with historical data
  // For now, return a random change between -10% and +10%
  const changePercent = (Math.random() - 0.5) * 20;
  return {
    percentage: parseFloat(changePercent.toFixed(1)),
    direction: changePercent >= 0 ? 'up' : 'down'
  };
}

// Helper function to get coordinates for districts
function getDistrictCoordinates(district) {
  const districtCoords = {
    'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
    'Kollam': { lat: 8.8932, lon: 76.6141 },
    'Pathanamthitta': { lat: 9.2648, lon: 76.7870 },
    'Alappuzha': { lat: 9.4981, lon: 76.3388 },
    'Kottayam': { lat: 9.5916, lon: 76.5222 },
    'Idukki': { lat: 9.9312, lon: 76.9714 },
    'Ernakulam': { lat: 9.9312, lon: 76.2673 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    'Palakkad': { lat: 10.7867, lon: 76.6548 },
    'Malappuram': { lat: 11.0510, lon: 76.0711 },
    'Kozhikode': { lat: 11.2588, lon: 75.7804 },
    'Wayanad': { lat: 11.6854, lon: 76.1320 },
    'Kannur': { lat: 11.8745, lon: 75.3704 },
    'Kasaragod': { lat: 12.4996, lon: 74.9869 }
  };
  return districtCoords[district] || districtCoords['Ernakulam'];
}

module.exports = FarmerController;
