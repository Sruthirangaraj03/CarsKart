const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  becomeHost,
  getHostProfile,
  updateHostProfile,
  getHostStats
} = require('../controllers/hostController');

router.post('/create', protect, becomeHost);
router.get('/view', protect, getHostProfile);
router.put('/update', protect, updateHostProfile);
router.get('/stats', protect, getHostStats);

module.exports = router;
