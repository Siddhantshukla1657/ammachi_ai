const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true, index: true }, // app-level id
  name: { type: String, required: true },
  email: { type: String }, // optional
  phone: { type: String }, // optional
  language: { type: String, default: 'malayalam' },
  crops: { type: [String], default: [] }, // e.g. ['coconut','pepper']
  experience: { type: Number, default: 0 }, // years
  farmSize: { type: String }, // e.g. "1.2 acres"
  location: {
    state: { type: String, default: 'Kerala' }, // always Kerala unless overridden
    district: { type: String, required: true }  // must have district
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', FarmerSchema);