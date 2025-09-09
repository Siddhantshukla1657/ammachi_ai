const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FarmerSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true, index: true }, 
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String, required: true }, 
  language: { type: String, default: 'malayalam' },
  crops: { type: [String], default: [] },
  experience: { type: Number, default: 0 },
  farmSize: { type: String }, 
  
  farms: { type: [{ name: String, acres: String, location: String, crops: [String] }], default: [] },
  location: {
    state: { type: String, default: 'Kerala' }, 
    district: { type: String, required: true }  
  },
  createdAt: { type: Date, default: Date.now }
});


FarmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

FarmerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', FarmerSchema);
