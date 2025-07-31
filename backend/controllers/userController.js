const IncomePayment = require('../models/IncomePayment');
const User = require('../models/User');
const Host = require('../models/Host');

exports.recordIncomePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, transactionId } = req.body;

    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const payment = await IncomePayment.create({ user: userId, amount, transactionId });
    await User.findByIdAndUpdate(userId, { role: 'host' });

    res.status(201).json({
      message: 'Payment recorded and role updated to host.',
      payment,
    });
  } catch (err) {
    console.error('Income Payment Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.becomeHost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingHost = await Host.findOne({ user: userId });
    if (existingHost) return res.status(400).json({ message: 'Already a host' });

    const { fullName, contactNumber, address, aadharNumber, pancardNumber } = req.body;

    const newHost = await Host.create({
      user: userId,
      fullName,
      contactNumber,
      address,
      aadharNumber,
      pancardNumber,
      isVerified: false,
    });

    await User.findByIdAndUpdate(userId, { role: 'host' });

    res.status(200).json({
      message: 'You are now a host!',
      host: newHost,
    });
  } catch (err) {
    console.error('Become Host Error:', err.message);
    res.status(500).json({ message: 'Server error while becoming host' });
  }
};
