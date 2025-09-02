const Host = require('../models/Host');
const Product = require('../models/Product');
const path = require('path');

// tiny replacement for express-async-handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// List all products for a host
const getHostProducts = asyncHandler(async (req, res) => {
  const { hostId } = req.params;
  const host = await Host.findById(hostId);
  if (!host) return res.status(404).json({ success: false, message: 'Host not found' });

  if (host.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const products = await Product.find({ adminId: hostId });
  
  // Log products to debug image paths
  console.log('📦 Retrieved products:', products.map(p => ({
    title: p.title,
    images: p.images
  })));
  
  res.json({ success: true, products });
});

// Create product - FIXED to match frontend FormData structure
const createProduct = asyncHandler(async (req, res) => {
  const { hostId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Verify host
    const host = await Host.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: 'Host not found' });
    }

    // Check if user is authorized
    if (host.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let productData;
    
    // Handle both JSON and form-data requests
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle form-data with images
      productData = JSON.parse(req.body.data || '{}');
      
      if (req.files && req.files.length > 0) {
        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        productData.images = {
          primary: imagePaths[0],
          gallery: imagePaths
        };
      }
    } else {
      // Handle JSON request
      productData = req.body;
    }

    // Create new product
    const product = new Product({
      ...productData,
      adminId: hostId
    });

    await product.save();

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});
// Update product - FIXED to match frontend FormData structure
const updateProduct = asyncHandler(async (req, res) => {
  console.log('🔄 Updating product...');
  console.log('📦 Request body:', req.body);
  console.log('📸 Files:', req.files ? req.files.length : 0);

  const { hostId, productId } = req.params;

  const host = await Host.findById(hostId);
  if (!host) return res.status(404).json({ success: false, message: 'Host not found' });
  if (host.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.adminId.toString() !== hostId) {
    return res.status(403).json({ success: false, message: 'Product does not belong to this host' });
  }

  // Build update object from FormData structure
  const updates = {};
  
  // Basic fields
  if (req.body.title) updates.title = req.body.title;
  if (req.body.description) updates.description = req.body.description;
  if (req.body.category) updates.category = req.body.category;
  if (req.body.brand) updates.brand = req.body.brand;
  if (req.body.model) updates.model = req.body.model;
  if (req.body.year) updates.year = parseInt(req.body.year);
  
  // Pricing updates
  if (req.body['pricing[hourly]'] || req.body['pricing[daily]'] || req.body['pricing[securityDeposit]']) {
    updates.pricing = { ...product.pricing };
    if (req.body['pricing[hourly]']) updates.pricing.hourly = parseFloat(req.body['pricing[hourly]']);
    if (req.body['pricing[daily]']) updates.pricing.daily = parseFloat(req.body['pricing[daily]']);
    if (req.body['pricing[securityDeposit]']) updates.pricing.securityDeposit = parseFloat(req.body['pricing[securityDeposit]']);
  }
  
  // Location updates
  if (req.body['location[address]'] || req.body['location[city]'] || req.body['location[state]'] || 
      req.body['location[pincode]'] || req.body['location[landmark]']) {
    updates.location = { ...product.location };
    if (req.body['location[address]']) updates.location.address = req.body['location[address]'];
    if (req.body['location[city]']) updates.location.city = req.body['location[city]'];
    if (req.body['location[state]']) updates.location.state = req.body['location[state]'];
    if (req.body['location[pincode]']) updates.location.pincode = req.body['location[pincode]'];
    if (req.body['location[landmark]']) updates.location.landmark = req.body['location[landmark]'];
  }
  
  // Specifications updates
  const specFields = ['fuelType', 'transmission', 'seatingCapacity', 'mileage', 'engineCapacity', 'color', 'registrationNumber'];
  if (specFields.some(field => req.body[`specifications[${field}]`])) {
    updates.specifications = { ...product.specifications };
    if (req.body['specifications[fuelType]']) updates.specifications.fuelType = req.body['specifications[fuelType]'];
    if (req.body['specifications[transmission]']) updates.specifications.transmission = req.body['specifications[transmission]'];
    if (req.body['specifications[seatingCapacity]']) updates.specifications.seatingCapacity = parseInt(req.body['specifications[seatingCapacity]']);
    if (req.body['specifications[mileage]']) updates.specifications.mileage = parseFloat(req.body['specifications[mileage]']);
    if (req.body['specifications[engineCapacity]']) updates.specifications.engineCapacity = parseFloat(req.body['specifications[engineCapacity]']);
    if (req.body['specifications[color]']) updates.specifications.color = req.body['specifications[color]'];
    if (req.body['specifications[registrationNumber]']) updates.specifications.registrationNumber = req.body['specifications[registrationNumber]'].toUpperCase();
  }

  // Handle image updates - FIXED
  if (req.files && req.files.length > 0) {
    console.log('📸 Updating images:', req.files.length);
    
    if (req.files.length > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 5 images allowed' 
      });
    }
    
    // Create new image paths
    const newImagePaths = req.files.map((file) => `/uploads/products/${file.filename}`);
    
    updates.images = {
      gallery: newImagePaths,
      primary: newImagePaths[0]
    };
    
    console.log('📸 New image data:', updates.images);
  }

  // Handle features
  const featuresArray = [];
  Object.keys(req.body).forEach(key => {
    if (key.startsWith('features[') && req.body[key]) {
      featuresArray.push(req.body[key]);
    }
  });
  if (featuresArray.length > 0) {
    updates.features = featuresArray;
  }

  // Insurance updates
  const insuranceFields = ['provider', 'policyNumber', 'expiryDate', 'coverageType'];
  if (insuranceFields.some(field => req.body[`insurance[${field}]`])) {
    updates.insurance = { ...product.insurance };
    if (req.body['insurance[provider]']) updates.insurance.provider = req.body['insurance[provider]'];
    if (req.body['insurance[policyNumber]']) updates.insurance.policyNumber = req.body['insurance[policyNumber]'];
    if (req.body['insurance[expiryDate]']) updates.insurance.expiryDate = new Date(req.body['insurance[expiryDate]']);
    if (req.body['insurance[coverageType]']) updates.insurance.coverageType = req.body['insurance[coverageType]'];
  }

  // Availability updates
  const availabilityFields = ['isAvailable', 'minBookingDuration', 'maxBookingDuration'];
  if (availabilityFields.some(field => req.body[`availability[${field}]`])) {
    updates.availability = { ...product.availability };
    if (req.body['availability[isAvailable]'] !== undefined) {
      updates.availability.isAvailable = req.body['availability[isAvailable]'] === 'true';
    }
    if (req.body['availability[minBookingDuration]']) updates.availability.minBookingDuration = parseInt(req.body['availability[minBookingDuration]']);
    if (req.body['availability[maxBookingDuration]']) updates.availability.maxBookingDuration = parseInt(req.body['availability[maxBookingDuration]']);
  }

  // Rules updates
  if (req.body['rules[drivingLicenseRequired]'] !== undefined) {
    updates.rules = { ...product.rules };
    updates.rules.drivingLicenseRequired = req.body['rules[drivingLicenseRequired]'] === 'true';
  }

  // Handle additional requirements
  const additionalReqArray = [];
  Object.keys(req.body).forEach(key => {
    if (key.startsWith('rules[additionalRequirements][') && req.body[key]) {
      additionalReqArray.push(req.body[key]);
    }
  });
  if (additionalReqArray.length > 0) {
    if (!updates.rules) updates.rules = { ...product.rules };
    updates.rules.additionalRequirements = additionalReqArray;
  }

  updates.updatedAt = new Date();

  try {
    Object.assign(product, updates);
    await product.save();
    
    console.log('✅ Product updated successfully:', {
      id: product._id,
      title: product.title,
      images: product.images
    });
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration number already exists' 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { hostId, productId } = req.params;

  const host = await Host.findById(hostId);
  if (!host) return res.status(404).json({ success: false, message: 'Host not found' });
  if (host.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.adminId.toString() !== hostId) {
    return res.status(403).json({ success: false, message: 'Product does not belong to this host' });
  }

  product.status = 'deleted';
  await product.save();

  res.json({ success: true, message: 'Product deleted', product });
});

// Restore product
const restoreProduct = asyncHandler(async (req, res) => {
  const { hostId, productId } = req.params;

  const host = await Host.findById(hostId);
  if (!host) return res.status(404).json({ success: false, message: 'Host not found' });
  if (host.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.adminId.toString() !== hostId) {
    return res.status(403).json({ success: false, message: 'Product does not belong to this host' });
  }

  product.status = 'active';
  await product.save();

  res.json({ success: true, message: 'Product restored', product });
});
const getAllProducts = async (req, res) => {
  try {
    console.log('🚗 Fetching all products for Rental Deals...');
    
    // Fetch all non-deleted products
    const products = await Product.find({ 
      isDeleted: { $ne: true } 
    })
    .populate('adminId', 'name email phone location') // Populate host info
    .sort({ createdAt: -1 }) // Newest first
    .lean();

    console.log(`✅ Found ${products.length} products`);

    res.json({
      success: true,
      count: products.length,
      products: products
    });

  } catch (error) {
    console.error('❌ Error fetching all products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * Search products with filters (optional for advanced search)
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = async (req, res) => {
  try {
    const { q, location, carType, minPrice, maxPrice } = req.query;
    
    console.log('🔍 Search query received:', { q, location, carType, minPrice, maxPrice });
    
    // Build filter object
    let filter = { isDeleted: { $ne: true } };
    
    // Handle general search query (q parameter)
    if (q && q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { category: searchRegex },
        { 'location.city': searchRegex },
        { 'location.state': searchRegex },
        { 'location.address': searchRegex },
        { 'specifications.fuelType': searchRegex },
        { 'specifications.transmission': searchRegex }
      ];
    }
    
    // Add specific location filter
    if (location && location.trim()) {
      const locationRegex = { $regex: location.trim(), $options: 'i' };
      filter.$or = [
        { 'location.city': locationRegex },
        { 'location.state': locationRegex },
        { 'location.address': locationRegex }
      ];
    }
    
    // Add car type filter
    if (carType && carType !== 'all') {
      filter.category = { $regex: carType, $options: 'i' };
    }
    
    // Add price range filter
    if (minPrice || maxPrice) {
      filter['pricing.daily'] = {};
      if (minPrice) filter['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.daily'].$lte = Number(maxPrice);
    }
    
    console.log('🔍 MongoDB filter:', JSON.stringify(filter, null, 2));
    
    const products = await Product.find(filter)
      .populate('adminId', 'name email phone location')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Search found ${products.length} products`);
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
    
  } catch (error) {
    console.error('❌ Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('🔍 Fetching single product:', productId);
    
    // Validate productId format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findOne({ 
      _id: productId,
      isDeleted: { $ne: true } 
    })
    .populate('adminId', 'name email phone location') // Populate host info
    .lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product found:', {
      id: product._id,
      title: product.title,
      host: product.adminId?.name
    });
    
    res.json({
      success: true,
      product: product
    });
    
  } catch (error) {
    console.error('❌ Error fetching single product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error: error.message
    });
  }
};

module.exports = {
  getHostProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
};