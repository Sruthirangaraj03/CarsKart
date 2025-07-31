const express = require('express');
const router = express.Router();
const { verifyToken, protect } = require('../middlewares/authMiddleware');
const { becomeHost, recordIncomePayment } = require('../controllers/userController');

router.post('/become-host', protect, becomeHost);
router.post('/income-payment', verifyToken, recordIncomePayment);

module.exports = router;