const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  contactNumber: String,
  address: String,
  aadharNumber: String,
  pancardNumber: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Host', hostSchema);