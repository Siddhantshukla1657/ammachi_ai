const Farmer = require('../models/Farmer');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');

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
        farms: payload.farms || []
      });

      await farmer.save();

      const profile = farmer.toObject();
      delete profile.password;

      const token = generateToken({ id: profile._id, email: profile.email, role: 'farmer' });

      res.status(201).json({ message: 'Farmer registered', profile, token });
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

      const ok = await farmer.comparePassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const profile = farmer.toObject();
      delete profile.password;

      const token = generateToken({ id: profile._id, email: profile.email, role: 'farmer' });

      res.json({ message: 'Logged in', profile, token });
    } catch (err) {
      console.error('Farmer login error:', err);
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  }
}

module.exports = FarmerController;
