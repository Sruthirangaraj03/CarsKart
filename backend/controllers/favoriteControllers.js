// controllers/favoritesController.js
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Add product to favorites
const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }

    // Create new favorite
    const favorite = new Favorite({
      user: userId,
      product: productId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Product added to favorites successfully',
      favorite: favorite
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'product',
        populate: {
          path: 'adminId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where product might have been deleted
    const validFavorites = favorites.filter(fav => fav.product);

    res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully',
      favorites: validFavorites,
      count: validFavorites.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove product from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Find and remove favorite
    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites successfully'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check if product is in user's favorites
const checkFavoriteStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id; // From auth middleware

    const favorite = await Favorite.findOne({
      user: userId,
      product: productId
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite,
      message: favorite ? 'Product is in favorites' : 'Product is not in favorites'
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get favorites count for a user
const getFavoritesCount = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const count = await Favorite.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: count,
      message: 'Favorites count retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting favorites count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Clear all favorites for a user
const clearAllFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const result = await Favorite.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: `Removed ${result.deletedCount} items from favorites`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getFavoritesCount,
  clearAllFavorites
};