const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Host = require('../models/Host');

const JWT_SECRET = process.env.JWT_SECRET;

// Utility: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      isHost: user.isHost || false,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, phone } = req.body;

    const userData = {
      email,
      password,
      phone,
      role: 'user',
      isHost: false,
    };

    // Name handling
    if (name) {
      userData.name = name;
      if (!firstName && !lastName) {
        const parts = name.split(' ');
        userData.firstName = parts[0];
        userData.lastName = parts.slice(1).join(' ');
      }
    }
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (!userData.name) {
      userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }

    const newUser = await User.create(userData);
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isHost: newUser.isHost,
      },
    });
  } catch (error) {
    console.error('❌ Signup Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const hostProfile = await Host.findOne({ user: user._id });
    const verifiedIsHost = user.role === 'host' && !!hostProfile;

    if (user.isHost !== verifiedIsHost) {
      await User.findByIdAndUpdate(user._id, { isHost: verifiedIsHost });
      user.isHost = verifiedIsHost;
    }

    const token = generateToken(user);
    const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || email.split('@')[0];

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: userName,
        email: user.email,
        role: user.role,
        isHost: verifiedIsHost,
        hostProfile: hostProfile?._id || null,
      },
    });

    console.log(`✅ ${user.email} logged in - Role: ${user.role}, Host: ${verifiedIsHost}`);
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get Current User Controller (/api/auth/me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hostProfile = await Host.findOne({ user: user._id });
    const verifiedIsHost = user.role === 'host' && !!hostProfile;

    if (user.isHost !== verifiedIsHost) {
      await User.findByIdAndUpdate(user._id, { isHost: verifiedIsHost });
      user.isHost = verifiedIsHost;
    }

    const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];

    res.status(200).json({
      id: user._id,
      name: userName,
      email: user.email,
      role: user.role,
      isHost: verifiedIsHost,
      hostProfile: hostProfile?._id || null,
      phone: user.phone,
      createdAt: user.createdAt,
      hostSince: user.hostSince || hostProfile?.createdAt || null,
    });

    console.log(`📋 Profile fetched for ${user.email} - Host: ${verifiedIsHost}`);
  } catch (error) {
    console.error('❌ GetMe Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Refresh Token Controller
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const hostProfile = await Host.findOne({ user: req.user._id });
    const verifiedIsHost = user.role === 'host' && !!hostProfile;

    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isHost: verifiedIsHost,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: newToken,
      user: {
        id: user._id,
        role: user.role,
        isHost: verifiedIsHost,
      },
    });
  } catch (error) {
    console.error('❌ Refresh Token Error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};
