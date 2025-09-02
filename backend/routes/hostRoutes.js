const express = require('express');
const router = express.Router();
const {
  becomeHost,
  checkHostStatus,
  getHostProfile,
  updateHostProfile,
  getHostStats,
  debugHostStatus // ✅ make sure this is defined in hostController
} = require('../controllers/hostController');
const { protect } = require('../middlewares/authMiddleware');

// Routes
router.post('/become', protect, becomeHost);
router.get('/check-status', protect, checkHostStatus);
router.get('/profile', protect, getHostProfile);
router.put('/profile', protect, updateHostProfile);
router.get('/stats', protect, getHostStats);

// ✅ Debug route for temporary troubleshooting
router.get('/debug', protect, debugHostStatus);

module.exports = router;
