// controllers/adminController.js
const Product = require('../models/Product');
const Host = require('../models/Host');

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Verify the admin exists and belongs to the authenticated user
    const host = await Host.findOne({ 
      _id: adminId, 
      user: req.user._id 
    }).populate('user', 'name email');
    
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found or unauthorized' 
      });
    }

    // Get all products for this admin (excluding deleted ones for main view)
    const products = await Product.find({ 
      adminId: adminId,
      status: { $ne: 'deleted' }
    }).sort({ createdAt: -1 });

    // Get deleted products separately for restore functionality
    const deletedProducts = await Product.find({ 
      adminId: adminId,
      status: 'deleted'
    }).sort({ updatedAt: -1 });

    // Calculate comprehensive stats
    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'active').length,
      inactiveProducts: products.filter(p => p.status === 'inactive').length,
      deletedProducts: deletedProducts.length,
      totalBookings: products.reduce((sum, p) => sum + (p.metrics?.totalBookings || 0), 0),
      totalRevenue: products.reduce((sum, p) => sum + (p.metrics?.totalRevenue || 0), 0),
      avgRating: products.length > 0 ? 
        (products.reduce((sum, p) => sum + (p.metrics?.rating?.average || 0), 0) / products.length).toFixed(2) : 0,
      recentBookings: products.reduce((sum, p) => sum + (p.metrics?.recentBookings || 0), 0)
    };

    // Get product categories breakdown
    const categoryBreakdown = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    // Get recent activity (last 5 products)
    const recentProducts = products.slice(0, 5);

    res.json({
      success: true,
      data: {
        admin: {
          id: host._id,
          name: host.name || host.user?.name,
          email: host.user?.email,
          joinDate: host.createdAt,
          location: host.location
        },
        products,
        deletedProducts,
        stats,
        categoryBreakdown,
        recentProducts
      }
    });

  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.id;
    
    const host = await Host.findOne({ 
      _id: adminId, 
      user: req.user._id 
    }).populate('user', 'name email phone createdAt');
    
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      data: host
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.id;
    const updates = req.body;
    
    const host = await Host.findOneAndUpdate(
      { _id: adminId, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');
    
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: host
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get admin analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Verify admin ownership
    const host = await Host.findOne({ 
      _id: adminId, 
      user: req.user._id 
    });
    
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    const products = await Product.find({ adminId: adminId });
    
    // Monthly revenue data (last 12 months)
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthProducts = products.filter(p => {
        const productDate = new Date(p.createdAt);
        return productDate.getMonth() === date.getMonth() && 
               productDate.getFullYear() === date.getFullYear();
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        products: monthProducts.length,
        revenue: monthProducts.reduce((sum, p) => sum + (p.metrics?.totalRevenue || 0), 0),
        bookings: monthProducts.reduce((sum, p) => sum + (p.metrics?.totalBookings || 0), 0)
      });
    }

    // Top performing products
    const topProducts = products
      .sort((a, b) => (b.metrics?.totalRevenue || 0) - (a.metrics?.totalRevenue || 0))
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        title: p.title,
        revenue: p.metrics?.totalRevenue || 0,
        bookings: p.metrics?.totalBookings || 0,
        rating: p.metrics?.rating?.average || 0
      }));

    res.json({
      success: true,
      data: {
        monthlyData,
        topProducts,
        totalProducts: products.length,
        totalRevenue: products.reduce((sum, p) => sum + (p.metrics?.totalRevenue || 0), 0),
        totalBookings: products.reduce((sum, p) => sum + (p.metrics?.totalBookings || 0), 0)
      }
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Bulk operations for products
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { productIds, action, data } = req.body;
    
    // Verify admin ownership
    const host = await Host.findOne({ 
      _id: adminId, 
      user: req.user._id 
    });
    
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateQuery = { status: 'active' };
        message = 'Products activated successfully';
        break;
      case 'deactivate':
        updateQuery = { status: 'inactive' };
        message = 'Products deactivated successfully';
        break;
      case 'delete':
        updateQuery = { status: 'deleted' };
        message = 'Products deleted successfully';
        break;
      case 'update':
        updateQuery = data;
        message = 'Products updated successfully';
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid action' 
        });
    }

    const result = await Product.updateMany(
      { 
        _id: { $in: productIds },
        adminId: adminId 
      },
      { 
        ...updateQuery,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};