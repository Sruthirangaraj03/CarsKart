const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  addReview,
  getReviewsByProduct,
  deleteReview,
  updateReview
} = require("../controllers/reviewController");

// ✅ IMPORTANT: Put more specific routes FIRST to avoid conflicts

// GET /api/reviews/product/:productId - get reviews for a product (no auth needed)
router.get("/product/:productId", getReviewsByProduct);

// POST /api/reviews/add/:productId - add review (auth required) - Made more specific
router.post("/add/:productId", protect, addReview);

// PUT /api/reviews/update/:reviewId - update review (auth required) - Made more specific  
router.put("/update/:reviewId", protect, updateReview);

// DELETE /api/reviews/delete/:reviewId - delete review (auth required) - Made more specific
router.delete("/delete/:reviewId", protect, deleteReview);

// ✅ Alternative: Keep original routes but ensure proper ordering
// POST /api/reviews/:productId - add review (auth required)
router.post("/:productId", protect, addReview);

// PUT /api/reviews/:reviewId - update review (auth required)
router.put("/:reviewId", protect, updateReview);

// DELETE /api/reviews/:reviewId - delete review (auth required)
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;