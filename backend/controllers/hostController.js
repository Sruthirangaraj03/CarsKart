const Host = require("../models/Host");
const User = require("../models/User");
const IncomePayment = require("../models/IncomePayment");

// ✅ IMPROVED: Check Host Status with better logic
exports.checkHostStatus = async (req, res) => {
  try {
    console.log("🔍 Checking host status for user:", req.user._id);

    // Step 1: Always fetch fresh user data from database (not from token)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Step 2: Check for host profile existence (most reliable check)
    const hostProfile = await Host.findOne({ user: req.user._id });
    
    // Step 3: Determine host status based on multiple factors
    const hasHostProfile = !!hostProfile;
    const userRoleIsHost = user.role === 'host';
    const userIsHostFlag = user.isHost === true;

    console.log("🔍 Host Status Debug:", {
      hasHostProfile,
      userRoleIsHost, 
      userIsHostFlag,
      userId: req.user._id
    });

    // Step 4: If no host profile exists, user is definitely not a host
    if (!hasHostProfile) {
      // Sync user flags to match reality
      if (userRoleIsHost || userIsHostFlag) {
        await User.findByIdAndUpdate(req.user._id, { 
          role: 'user', 
          isHost: false 
        });
        console.log("🔄 User flags corrected - removed host status");
      }

      return res.status(200).json({
        success: true,
        isHost: false,
        userType: "user",
        message: "User is not a host",
        action: "redirect_to_pricing",
        redirectTo: "/pricing"
      });
    }

    // Step 5: Host profile exists - sync user flags if needed
    if (!userRoleIsHost || !userIsHostFlag) {
      await User.findByIdAndUpdate(req.user._id, { 
        role: 'host', 
        isHost: true 
      });
      console.log("🔄 User flags corrected - added host status");
    }

    // Step 6: Get latest payment for plan info
    const latestPayment = await IncomePayment.findOne({ 
      user: req.user._id 
    }).sort({ paidAt: -1 });

    // Step 7: Plan mapping
    const planMapping = {
      1: { name: "Self-Service Monthly", price: "₹499", duration: "per month", agent: false },
      2: { name: "Agent Assisted Monthly", price: "₹899", duration: "per month", agent: true },
      3: { name: "Self-Service Annual", price: "₹7,999", duration: "per year", agent: false },
      4: { name: "Agent Assisted Annual", price: "₹13,999", duration: "per year", agent: true }
    };

    const currentPlanId = hostProfile.planId || latestPayment?.planId || 1;
    const currentPlan = planMapping[currentPlanId] || planMapping[1];

    // Step 8: Return complete host data
    return res.status(200).json({
      success: true,
      isHost: true,
      userType: "host",
      message: "User is already a host",
      action: "show_current_plan",
      hostData: {
        id: hostProfile._id,
        fullName: hostProfile.fullName,
        email: hostProfile.email || user.email,
        contactNumber: hostProfile.contactNumber,
        isVerified: hostProfile.isVerified,
        createdAt: hostProfile.createdAt,
        lastPayment: hostProfile.lastPayment || latestPayment?.paidAt,
        currentPlan: {
          id: currentPlanId,
          name: currentPlan.name,
          price: currentPlan.price,
          duration: currentPlan.duration,
          agent: currentPlan.agent,
          activeSince: hostProfile.createdAt,
          lastPaymentDate: latestPayment?.paidAt,
          paymentAmount: latestPayment?.amount
        }
      },
      redirectTo: "/admin"
    });

  } catch (error) {
    console.error("❌ Check host status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error checking host status",
      error: error.message 
    });
  }
};

// ✅ IMPROVED: Become a Host
exports.becomeHost = async (req, res) => {
  try {
    // Check if already has host profile
    const existingHost = await Host.findOne({ user: req.user._id });
    if (existingHost) {
      return res.status(400).json({ message: 'User is already a host' });
    }

    // Get fresh user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];

    // Create host profile
    const host = new Host({
      user: user._id,
      fullName,
      email: user.email,
      contactNumber: user.phone || '',
      isVerified: false,
    });

    await host.save();

    // Update user flags
    await User.findByIdAndUpdate(user._id, { 
      role: 'host', 
      isHost: true,
      hostSince: new Date()
    });

    console.log("✅ New host created:", host._id);
    res.status(201).json({ message: 'User is now a host', host });
  } catch (error) {
    console.error('❌ Host creation failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ IMPROVED: Get Host Profile  
exports.getHostProfile = async (req, res) => {
  try {
    const host = await Host.findOne({ user: req.user._id }).populate("user", "email name");
    if (!host) {
      return res.status(404).json({ message: "Host profile not found" });
    }

    // Get latest payment info
    const latestPayment = await IncomePayment.findOne({ 
      user: req.user._id 
    }).sort({ paidAt: -1 });

    const response = {
      ...host.toObject(),
      latestPayment: latestPayment ? {
        amount: latestPayment.amount,
        paidAt: latestPayment.paidAt,
        planId: latestPayment.planId
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Get host profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ IMPROVED: Update Host Profile
exports.updateHostProfile = async (req, res) => {
  try {
    const updatedHost = await Host.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedHost) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    res.json(updatedHost);
  } catch (error) {
    console.error("❌ Update host profile error:", error);
    res.status(500).json({ message: "Error updating host", error: error.message });
  }
};

// ✅ IMPROVED: Get Host Statistics
exports.getHostStats = async (req, res) => {
  try {
    // Get actual payment data
    const payments = await IncomePayment.find({ user: req.user._id });
    const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = payments.length;

    // TODO: Calculate from actual bookings collection when available
    const totalTrips = 0; // await Booking.countDocuments({ host: req.user._id });

    res.json({ 
      totalTrips, 
      income: totalIncome,
      totalPayments,
      lastPayment: payments.length > 0 ? payments[payments.length - 1].paidAt : null
    });
  } catch (error) {
    console.error("❌ Get host stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

exports.debugHostStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const host = await Host.findOne({ user: req.user._id });
    const latestPayment = await IncomePayment.findOne({ 
      user: req.user._id 
    }).sort({ paidAt: -1 });

    res.json({
      debug: {
        userId: req.user._id,
        userFromDB: {
          id: user?._id,
          role: user?.role,
          isHost: user?.isHost,
          email: user?.email
        },
        hostProfile: {
          exists: !!host,
          id: host?._id,
          fullName: host?.fullName,
          isVerified: host?.isVerified,
          planId: host?.planId
        },
        latestPayment: {
          exists: !!latestPayment,
          amount: latestPayment?.amount,
          planId: latestPayment?.planId,
          paidAt: latestPayment?.paidAt
        },
        tokenData: {
          id: req.user.id,
          role: req.user.role,
          isHost: req.user.isHost
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};