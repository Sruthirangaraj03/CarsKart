const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One host per user
  },
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  aadharNumber: {
    type: String,
    default: ''
  },
  pancardNumber: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Host', hostSchema);
