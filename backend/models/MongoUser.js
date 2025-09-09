const mongoose = require('mongoose');

const MongoUserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  displayName: { type: String },
  provider: { type: String, default: 'email' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MongoUser', MongoUserSchema);
