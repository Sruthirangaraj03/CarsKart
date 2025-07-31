const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  description: String,
  aboutOwner: String,
  numberOfTrips: {
    type: Number,
    default: 0
  },
  features: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
