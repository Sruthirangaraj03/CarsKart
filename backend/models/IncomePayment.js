const mongoose = require('mongoose');

const incomePaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  transactionId: { type: String },
});

module.exports = mongoose.model('IncomePayment', incomePaymentSchema);
