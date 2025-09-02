const express = require('express');
const router = express.Router();
const {
  createBookingOrder,
  verifyPayment,
  getUserBookings,
  getBookingDetails,
  cancelBooking
} = require('../controllers/bookingControllers');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// Create booking and Razorpay order
router.post('/create-order', createBookingOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

// Get user's bookings
router.get('/', getUserBookings);

// Get booking details
router.get('/:id', getBookingDetails);

// Cancel booking
router.put('/:id/cancel', cancelBooking);

module.exports = router;