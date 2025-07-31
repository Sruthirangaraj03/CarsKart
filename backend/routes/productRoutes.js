const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload'); // correct import
const { protect } = require('../middlewares/authMiddleware');
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Routes
router.post('/create', protect, upload.single('image'), createProduct);
router.get('/view', protect, getMyProducts);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);


module.exports = router;
