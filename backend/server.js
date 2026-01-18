require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const hostRoutes = require('./routes/hostRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favRoutes = require('./routes/favRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// COMPLETELY OPEN CORS - ALLOWS ALL ORIGINS
// ============================================
app.use(cors({
  origin: '*', // Allow ALL origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false, // Set to false when using origin: '*'
  optionsSuccessStatus: 200
}));

// Additional headers for maximum compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🚗 CarsKart API running - CORS fully open');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 CORS: FULLY OPEN - All origins allowed`);
});