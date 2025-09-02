const express = require('express');
const { login, signup, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/refresh', protect, refreshToken);

module.exports = router;
