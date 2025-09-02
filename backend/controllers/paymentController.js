const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Host = require("../models/Host");
const IncomePayment = require("../models/IncomePayment");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Create Order (unchanged)
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({ success: false, error: "Order creation failed" });
  }
};

// ✅ IMPROVED: Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, planId } = req.body;

    console.log("🔍 Payment verification for user:", req.user._id);

    // Step 1: Verify signature
    const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(bodyData)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    // Step 2: Get fresh user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Step 3: Save payment record
    const newIncome = new IncomePayment({
      user: req.user._id,
      amount: amount / 100, // Convert from paise to rupees
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId: planId,
      paidAt: new Date(),
    });
    await newIncome.save();

    // Step 4: Update user to host (CRITICAL!)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        role: 'host',
        isHost: true,
        hostSince: new Date(),
        lastSubscription: new Date()
      },
      { new: true }
    );

    console.log("✅ User updated - Role:", updatedUser.role, "IsHost:", updatedUser.isHost);

    // Step 5: Create or update host profile  
    let hostProfile = await Host.findOne({ user: req.user._id });
    
    if (!hostProfile) {
      const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];

      hostProfile = new Host({
        user: req.user._id,
        fullName,
        email: user.email,
        contactNumber: user.phone || '',
        planId: planId,
        isVerified: true,
        createdAt: new Date(),
        lastPayment: new Date(),
      });
      
      await hostProfile.save();
      console.log("🏠 New host profile created");
    } else {
      hostProfile.isVerified = true;
      hostProfile.lastPayment = new Date();
      hostProfile.planId = planId;
      await hostProfile.save();
      console.log("🏠 Host profile updated");
    }

    // Step 6: Return success response
    res.status(200).json({
      success: true,
      message: "Payment verified and user upgraded to host",
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: amount / 100,
        hostId: hostProfile._id.toString(),
        isHost: true,
        role: 'host',
        planId: planId,
        user: {
          id: updatedUser._id,
          isHost: true,
          role: 'host'
        }
      }
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Payment verification failed",
      details: error.message 
    });
  }
};
