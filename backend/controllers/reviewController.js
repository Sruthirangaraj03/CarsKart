const mongoose = require('mongoose');
const Review = require('../models/Review');

// Add a new review
exports.addReview = async (req, res) => {
  try {
    console.log('📝 Adding review - User:', req.user._id, 'Product:', req.params.productId);
    console.log('📝 Review data:', req.body);
    
    const { productId } = req.params;
    const { rating, comment, stars } = req.body;
    
    // ✅ Handle both 'rating' and 'stars' field names
    const reviewRating = rating || stars;
    
    // Validate input
    if (!reviewRating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating and comment are required' 
      });
    }
    
    if (reviewRating < 1 || reviewRating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID' 
      });
    }
    
    // ✅ REMOVED: Check for existing review to allow multiple reviews per user
    // Users can now post multiple reviews for the same product
    
    const review = new Review({
      product: productId,
      user: req.user._id,
      stars: parseInt(reviewRating), // ✅ Save as 'stars' in database
      comment: comment.trim()
    });
    
    await review.save();
    // ✅ Populate user with more fields including name
    await review.populate('user', 'name email firstName lastName username');
    
    console.log('✅ Review added successfully:', review._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Review added successfully',
      review: {
        ...review.toObject(),
        rating: review.stars // ✅ Send back as 'rating' for frontend consistency
      }
    });
  } catch (error) {
    console.error('❌ Add Review Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get reviews for a specific product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('📖 Getting reviews for product:', productId);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    
    const reviews = await Review.find({ product: productId })
      // ✅ Populate user with more fields to get proper names
      .populate('user', 'name email firstName lastName username')
      .sort({ createdAt: -1 });
    
    // ✅ Convert 'stars' field to 'rating' for frontend consistency
    const reviewsWithRating = reviews.map(review => ({
      ...review.toObject(),
      rating: review.stars
    }));
    
    console.log('✅ Found reviews:', reviews.length);
    
    res.status(200).json({ 
      success: true, 
      count: reviews.length,
      reviews: reviewsWithRating
    });
  } catch (error) {
    console.error('❌ Get Reviews Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    console.log('📝 Updating review:', req.params.reviewId, 'by user:', req.user._id);
    
    const { reviewId } = req.params;
    const { rating, comment, stars } = req.body;
    
    // ✅ Handle both 'rating' and 'stars' field names
    const reviewRating = rating || stars;
    
    // Validate input
    if (reviewRating && (reviewRating < 1 || reviewRating > 5)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }
    
    const review = await Review.findOne({ 
      _id: reviewId, 
      user: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found or you are not authorized to update it' 
      });
    }
    
    // Update fields if provided
    if (reviewRating !== undefined) review.stars = parseInt(reviewRating);
    if (comment !== undefined) review.comment = comment.trim();
    
    await review.save();
    // ✅ Populate user with more fields
    await review.populate('user', 'name email firstName lastName username');
    
    console.log('✅ Review updated successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Review updated successfully',
      review: {
        ...review.toObject(),
        rating: review.stars // ✅ Send back as 'rating' for frontend
      }
    });
  } catch (error) {
    console.error('❌ Update Review Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    console.log('🗑️ Deleting review:', req.params.reviewId, 'by user:', req.user._id);
    
    const { reviewId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid review ID' 
      });
    }
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    await Review.findByIdAndDelete(reviewId);
    
    console.log('✅ Review deleted successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete Review Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};