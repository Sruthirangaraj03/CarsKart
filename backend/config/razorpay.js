const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.error('Missing Razorpay credentials in environment variables');
  console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'MISSING');
  console.error('RAZORPAY_SECRET:', process.env.RAZORPAY_SECRET ? 'Present' : 'MISSING');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET, // Using RAZORPAY_SECRET from your .env
});

module.exports = razorpay;