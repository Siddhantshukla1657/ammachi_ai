const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  name: { type: String, required: true },           
  area: { type: Number, required: true },           
  location: {
    state: { type: String, default: 'Kerala' },    
    district: { type: String, required: true }     
  },
  crops: { type: [String], default: [] }          
});

module.exports = FarmSchema;
