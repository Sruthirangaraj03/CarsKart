const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  phone: String,
  role: {
    type: String,
    enum: ['buyer', 'seller', 'user'],
    default: 'user'
  },
  address: String
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