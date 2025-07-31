
const Host = require("../models/Host");

// Become a Host
exports.becomeHost = async (req, res) => {
  const { fullName, contactNumber, bio } = req.body;

  try {
    const existingHost = await Host.findOne({ user: req.user._id });
    if (existingHost)
      return res.status(400).json({ message: "Already a host." });

    const newHost = new Host({
      user: req.user._id,
      fullName,
      contactNumber,
      bio,
    });

    await newHost.save();
    res.status(201).json({ message: "Host profile created", host: newHost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// View Host Profile
exports.getHostProfile = async (req, res) => {
  const host = await Host.findOne({ user: req.user._id }).populate("user", "email");
  if (!host) return res.status(404).json({ message: "Host profile not found" });
  res.json(host);
};

// Update Host Profile
exports.updateHostProfile = async (req, res) => {
  const updatedHost = await Host.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true }
  );
  if (!updatedHost) return res.status(404).json({ message: "Host not found" });
  res.json(updatedHost);
};

exports.getHostStats = async (req, res) => {
  // Example logic placeholder
  const totalTrips = 5; // Later calculate from bookings
  const income = 1000; // From payment history
  res.json({ totalTrips, income });
};
