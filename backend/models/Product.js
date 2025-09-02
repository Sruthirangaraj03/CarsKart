// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Host Reference
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: [true, 'Host ID is required']
  },
  
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Vehicle Details
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Convertible', 'Truck', 'Van', 'Bike', 'Scooter'],
    default: 'Sedan'
  },
  
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in future']
  },
  
  // Simplified Pricing (only hourly and daily)
  pricing: {
    hourly: {
      type: Number,
      min: [0, 'Hourly price cannot be negative'],
      default: 0
    },
    daily: {
      type: Number,
      required: [true, 'Daily price is required'],
      min: [1, 'Daily price must be at least 1']
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
      default: 1000
    }
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Please enter a valid 6-digit pincode'
      }
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Vehicle Specifications
  specifications: {
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
      default: 'Petrol'
    },
    transmission: {
      type: String,
      required: [true, 'Transmission is required'],
      enum: ['Manual', 'Automatic', 'CVT', 'AMT'],
      default: 'Manual'
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Seating capacity must be at least 1'],
      max: [15, 'Seating capacity cannot exceed 15'],
      default: 5
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [1, 'Mileage must be at least 1']
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    engineCapacity: {
      type: Number,
      min: [0, 'Engine capacity cannot be negative'],
      default: 0
    }
  },
  
  // Features Array
  features: {
    type: [String],
    default: []
  },
  
  // Images
  images: {
    primary: {
      type: String,
      default: ''
    },
    gallery: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5;
        },
        message: 'Maximum 5 images allowed'
      }
    }
  },
  
  // Insurance Details
  insurance: {
    provider: {
      type: String,
      required: [true, 'Insurance provider is required']
    },
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Insurance expiry date is required'],
      validate: {
        validator: function(date) {
          return date > new Date();
        },
        message: 'Insurance expiry date must be in the future'
      }
    },
    coverageType: {
      type: String,
      enum: ['Comprehensive', 'Third Party'],
      default: 'Third Party'
    }
  },
  
  // Availability
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    minBookingDuration: {
      type: Number,
      default: 1,
      min: [1, 'Minimum booking duration must be at least 1 hour']
    },
    maxBookingDuration: {
      type: Number,
      default: 720,
      min: [1, 'Maximum booking duration must be at least 1 hour']
    }
  },
  
  // Simplified Rules (removed age limit for cars)
  rules: {
    drivingLicenseRequired: {
      type: Boolean,
      default: true
    },
    additionalRequirements: {
      type: [String],
      default: []
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted', 'maintenance', 'pending_approval'],
    default: 'active'
  },
  
  // Analytics
  metrics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    views: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
productSchema.index({ adminId: 1, status: 1 });
productSchema.index({ category: 1, 'location.city': 1 });
productSchema.index({ 'pricing.daily': 1 });
productSchema.index({ 'specifications.registrationNumber': 1 }, { unique: true });
productSchema.index({ createdAt: -1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set primary image from gallery if not set
  if (this.images.gallery && this.images.gallery.length > 0 && !this.images.primary) {
    this.images.primary = this.images.gallery[0];
  }
  
  next();
});

// Static methods
productSchema.statics.getByAdmin = function(adminId, options = {}) {
  const query = { adminId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Transform for JSON
productSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);