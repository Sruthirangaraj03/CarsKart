const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'host', 'admin'], default: 'user' },
  
  // ✅ NEW: Subscription fields
  currentSubscriptionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subscription' 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'expired', 'none'], 
    default: 'none' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Hash password only if modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);