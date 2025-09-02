const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// ✅ Add virtual for 'rating' field to maintain frontend compatibility
reviewSchema.virtual('rating').get(function() {
  return this.stars;
});

// ✅ REMOVED: Unique compound index to allow multiple reviews from same user for same product
// Users can now post multiple reviews for the same product
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ✅ Add regular indexes for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);