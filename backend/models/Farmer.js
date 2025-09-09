const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const FarmerSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String, required: true }, // hashed password
  language: { type: String, default: 'malayalam' },
  crops: { type: [String], default: [] },
  experience: { type: Number, default: 0 },
  farmSize: { type: String },
  location: {
    state: { type: String, default: 'Kerala' },
    district: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});


FarmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // 10 = salt rounds
  next();
});

FarmerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', FarmerSchema);