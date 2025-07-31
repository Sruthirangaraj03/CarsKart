const express = require("express");
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  storeSubscription 
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

// Existing routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;