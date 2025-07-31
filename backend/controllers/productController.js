const Product = require('../models/Product');
const Host = require('../models/Host');

exports.createProduct = async (req, res) => {
  try {
    const host = await Host.findOne({ user: req.user._id });
    if (!host) return res.status(400).json({ message: "Host not found" });

    const { title, description, aboutOwner, features } = req.body;

    const product = await Product.create({
      host: host._id,
      title,
      image: req.file.path, // multer stores file info in req.file
      description,
      aboutOwner,
      features: JSON.parse(features), // frontend must send features as JSON string
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const host = await Host.findOne({ user: req.user._id });
    const products = await Product.find({ host: host._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // If a new image is uploaded
    if (req.file) {
      // Delete old image from disk if it exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', product.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Failed to delete old image:', err.message);
          }
        });
      }

      // Update image in DB
      updates.image = req.file.filename;
    }

    // Apply updates
    Object.assign(product, updates);
    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during update' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
