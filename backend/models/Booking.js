const mongoose = require('mongoose');

const customerInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  drivingLicense: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  }
});

const pricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  taxes: {
    type: Number,
    required: true
  },
  insurance: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: function() {
      return `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '10:00'
  },
  endTime: {
    type: String,
    default: '18:00'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  customerInfo: customerInfoSchema,
  pickupLocation: {
    type: String,
    required: true
  },
  customPickupAddress: {
    type: String,
    default: ''
  },
  additionalRequests: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  pricing: pricingSchema,
  // In your models/Booking.js file, update the status field:
status: {
  type: String,
  enum: [
    'pending', 
    'confirmed', 
    'cancelled', 
    'completed', 
    'payment_failed',
    'payment_verification_failed' // Add this to fix the enum error
  ],
  default: 'pending'
},
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);