const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  name: { type: String, required: true },           // Name of the farm
  area: { type: Number, required: true },           // Area in acres
  location: {
    state: { type: String, default: 'Kerala' },    // State (default Kerala)
    district: { type: String, required: true }     // District
  },
  crops: { type: [String], default: [] }           // Types of crops in this farm
});

module.exports = FarmSchema;
