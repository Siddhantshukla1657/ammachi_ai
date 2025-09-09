const mongoose = require('mongoose');

const MongoUserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  displayName: { type: String },
  provider: { type: String, default: 'email' },
  role: { type: String, default: 'farmer' },
  
  // Farmer-specific fields
  experience: { type: Number, default: 0 },
  farmSize: { type: String, default: '' },
  district: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  primaryCrops: { type: [String], default: [] },
  language: { type: String, default: 'english' },
  farms: [{
    name: String,
    acres: String,
    location: String,
    crops: [String]
  }],
  
  // Activity tracking
  cropsScanned: { type: Number, default: 0 },
  questionsAsked: { type: Number, default: 0 },
  daysActive: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MongoUser', MongoUserSchema);
