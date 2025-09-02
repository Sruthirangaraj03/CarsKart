const express = require('express');
const router = express.Router();
const {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getFavoritesCount,
  clearAllFavorites
} = require('../controllers/favoriteControllers');

// Import the protect middleware function
const { protect } = require('../middlewares/authMiddleware');

// Add product to favorites
// POST /api/favorites/add
router.post('/add', protect, addToFavorites);

// Get user's favorites
// GET /api/favorites
router.get('/', protect, getFavorites);

// Remove product from favorites
// DELETE /api/favorites/remove
router.delete('/remove', protect, removeFromFavorites);

// Check if product is in favorites
// GET /api/favorites/check/:productId
router.get('/check/:productId', protect, checkFavoriteStatus);

// Get favorites count
// GET /api/favorites/count
router.get('/count', protect, getFavoritesCount);

// Clear all favorites
// DELETE /api/favorites/clear
router.delete('/clear', protect, clearAllFavorites);

module.exports = router;