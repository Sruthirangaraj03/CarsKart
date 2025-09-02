const express = require('express');
const router = express.Router();
const { upload, handleUploadErrors } = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');
const {
  getHostProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct, // Import the new function
} = require('../controllers/productController');

// Public routes FIRST (most specific to least specific)
router.get('/products/search', searchProducts);
router.get('/products/:productId', getSingleProduct); // Add this route for single product
router.get('/products', getAllProducts);

// All routes below require authentication
router.use(protect);

// Debug middleware for image uploads
const debugImageUpload = (req, res, next) => {
  console.log('🖼️ Image Upload Debug:');
  console.log('Files received:', req.files ? req.files.length : 0);
  
  if (req.body && typeof req.body === 'object') {
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body content:', req.body);
  } else {
    console.log('Body:', req.body || 'No body received');
  }
  
  if (req.files && req.files.length > 0) {
    console.log('📁 Uploaded files:');
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        path: file.path
      });
    });
  } else {
    console.log('📁 No files uploaded');
  }
  
  next();
};

// HOST ROUTES (protected) - Order matters: specific to general
/**
 * Create product - MUST come before /:productId routes
 */
router.post('/host/:hostId/products', 
  upload.array('images', 5), 
  handleUploadErrors,
  debugImageUpload, 
  createProduct
);

/**
 * Update product - MUST come before general /:productId route
 */
router.put('/host/:hostId/products/:productId', 
  upload.array('images', 5), 
  handleUploadErrors,
  debugImageUpload, 
  updateProduct
);

/**
 * Delete product
 */
router.delete('/host/:hostId/products/:productId', deleteProduct);

/**
 * Restore product
 */
router.patch('/host/:hostId/products/:productId/restore', restoreProduct);

/**
 * Get single product (for editing) - More specific route
 */
router.get('/host/:hostId/products/:productId', async (req, res) => {
  try {
    const { hostId, productId } = req.params;
    
    const Host = require('../models/Host');
    const Product = require('../models/Product');
    
    const host = await Host.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: 'Host not found' });
    }
    
    if (host.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.adminId.toString() !== hostId) {
      return res.status(403).json({ success: false, message: 'Product does not belong to this host' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Get single product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error'
    });
  }
});

/**
 * Get host's products (dashboard) - Less specific route, put LAST
 */
router.get('/host/:hostId/products', getHostProducts);

module.exports = router;