const mongoose = require('mongoose');

const CropDiarySchema = new mongoose.Schema({
  farmerId: { type: String, required: true, index: true }, // reference to farmer
  farmName: { type: String, required: true },              // reference to specific farm
  crop: { type: String, required: true },                  // crop name
  diseaseDetected: { type: String },                       // optional disease detected
  severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
  treatmentSuggested: { type: String },
  images: { type: [String], default: [] },                 // multiple images per entry
  createdAt: { type: Date, default: Date.now }
});

// Optional index for fast queries by farmer and farm
CropDiarySchema.index({ farmerId: 1, farmName: 1, crop: 1, createdAt: -1 });

module.exports = mongoose.model('CropDiary', CropDiarySchema);