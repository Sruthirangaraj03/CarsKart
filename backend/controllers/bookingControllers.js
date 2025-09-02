// Debug environment variables
console.log('=== RAZORPAY CONFIG CHECK ===');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'MISSING');
console.log('RAZORPAY_SECRET:', process.env.RAZORPAY_SECRET ? 'Present' : 'MISSING');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');

// Create a new booking and Razorpay order
exports.createBookingOrder = async (req, res) => {
  try {
    const {
      productId,
      startDate,
      endDate,
      startTime,
      endTime,
      quantity,
      customerInfo,
      pickupLocation,
      customPickupAddress,
      additionalRequests,
      paymentMethod,
      pricing
    } = req.body;

    console.log('=== CREATE BOOKING ORDER START ===');
    console.log('User ID:', req.user?.id);
    console.log('Received booking request:', {
      productId,
      startDate,
      endDate,
      customerInfo: customerInfo ? 'Present' : 'Missing',
      pricing: pricing ? 'Present' : 'Missing'
    });

    // Enhanced validation with detailed error messages
    const errors = [];
    if (!productId) errors.push('Product ID is required');
    if (!startDate) errors.push('Start date is required');
    if (!endDate) errors.push('End date is required');
    if (!customerInfo) errors.push('Customer information is required');
    if (!customerInfo?.fullName) errors.push('Customer full name is required');
    if (!customerInfo?.phone) errors.push('Customer phone is required');
    if (!customerInfo?.email) errors.push('Customer email is required');
    if (!customerInfo?.drivingLicense) errors.push('Driving license is required');
    if (!pricing) errors.push('Pricing information is required');
    if (!pricing?.total) errors.push('Total price is required');
    if (!pricing?.securityDeposit) errors.push('Security deposit is required');

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        receivedData: {
          productId: !!productId,
          startDate: !!startDate,
          endDate: !!endDate,
          customerInfo: !!customerInfo,
          pricing: !!pricing
        }
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    if (start < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Check if product exists
    console.log('Checking product existence for ID:', productId);
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    console.log('Product found:', product.title);

    // Check product availability (enhanced query)
    console.log('Checking availability for dates:', startDate, 'to', endDate);
    const existingBookings = await Booking.find({
      productId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (existingBookings.length > 0) {
      console.log('Product not available - existing bookings:', existingBookings.length);
      return res.status(400).json({
        success: false,
        message: 'Product not available for the selected dates',
        conflictingBookings: existingBookings.map(b => ({
          id: b.bookingId,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status
        }))
      });
    }
    console.log('Product is available for booking');

    // Validate Razorpay instance
    if (!razorpay || !razorpay.orders) {
      console.error('Razorpay not properly initialized');
      console.error('Razorpay config:', {
        hasRazorpay: !!razorpay,
        hasOrders: !!razorpay?.orders,
        keyId: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
      });
      return res.status(500).json({
        success: false,
        message: 'Payment service not available. Please try again later.'
      });
    }

    // Validate and sanitize pricing data
    const sanitizedPricing = {
      basePrice: Math.round(Number(pricing.basePrice) || 0),
      subtotal: Math.round(Number(pricing.subtotal) || 0),
      taxes: Math.round(Number(pricing.taxes) || 0),
      insurance: Math.round(Number(pricing.insurance) || 0),
      securityDeposit: Math.round(Number(pricing.securityDeposit) || 0),
      total: Math.round(Number(pricing.total) || 0)
    };

    // Validate total amount
    if (sanitizedPricing.total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount',
        pricing: sanitizedPricing
      });
    }

    console.log('Sanitized pricing:', sanitizedPricing);

    // Create booking in database with pending status
    console.log('Creating booking in database...');
    const bookingData = {
      productId,
      userId: req.user.id,
      startDate: start,
      endDate: end,
      startTime: startTime || '10:00',
      endTime: endTime || '18:00',
      quantity: Math.max(1, parseInt(quantity) || 1),
      customerInfo: {
        fullName: customerInfo.fullName.trim(),
        phone: customerInfo.phone.trim(),
        email: customerInfo.email.toLowerCase().trim(),
        drivingLicense: customerInfo.drivingLicense.trim(),
        address: customerInfo.address ? customerInfo.address.trim() : ''
      },
      pickupLocation: pickupLocation || 'owner_location',
      customPickupAddress: customPickupAddress ? customPickupAddress.trim() : '',
      additionalRequests: additionalRequests ? additionalRequests.trim() : '',
      paymentMethod: paymentMethod || 'razorpay',
      pricing: sanitizedPricing,
      status: 'pending'
    };

    const booking = new Booking(bookingData);
    await booking.save();
    console.log('Booking saved with ID:', booking.bookingId);

    // Create Razorpay order
    const amount = sanitizedPricing.total * 100; // Convert to paise
    const currency = 'INR';
    
    const razorpayOptions = {
      amount: amount,
      currency: currency,
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        productId: productId.toString(),
        userId: req.user.id.toString(),
        customerName: customerInfo.fullName,
        customerEmail: customerInfo.email,
        productTitle: product.title
      }
    };

    console.log('Creating Razorpay order with amount:', amount, 'paise (₹' + (amount/100) + ')');
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(razorpayOptions);
      console.log('Razorpay order created successfully:', razorpayOrder.id);
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      
      // Delete the booking if Razorpay order fails
      await Booking.findByIdAndDelete(booking._id);
      
      return res.status(500).json({
        success: false,
        message: 'Payment order creation failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      });
    }
    
    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();
    console.log('Booking updated with Razorpay order ID');

    // Return success response
    const response = {
      success: true,
      message: 'Booking created successfully',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        createdAt: booking.createdAt
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      }
    };

    console.log('=== CREATE BOOKING ORDER SUCCESS ===');
    res.status(201).json(response);

  } catch (error) {
    console.error('=== CREATE BOOKING ORDER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Enhanced error response
    let errorMessage = 'Server error while creating booking';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid booking data';
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid product ID';
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'Booking already exists for this combination';
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

// Verify Razorpay payment and update booking
exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    console.log('=== PAYMENT VERIFICATION START ===');
    console.log('Verification request:', {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? 'Present' : 'Missing'
    });

    // Validate required fields
    const missingFields = [];
    if (!bookingId) missingFields.push('bookingId');
    if (!razorpay_order_id) missingFields.push('razorpay_order_id');
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields',
        missingFields: missingFields
      });
    }

    // Find the booking
    console.log('Finding booking with ID:', bookingId, 'for user:', req.user.id);
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId: req.user.id 
    });
    
    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }
    
    console.log('Booking found:', booking.bookingId, 'Status:', booking.status);

    // Check if booking is in correct state
    if (booking.status !== 'pending') {
      console.log('Invalid booking status for payment verification:', booking.status);
      return res.status(400).json({
        success: false,
        message: `Cannot verify payment for booking with status: ${booking.status}`,
        currentStatus: booking.status
      });
    }

    // Verify Razorpay order ID matches
    if (booking.razorpayOrderId !== razorpay_order_id) {
      console.log('Order ID mismatch:', {
        bookingOrderId: booking.razorpayOrderId,
        receivedOrderId: razorpay_order_id
      });
      return res.status(400).json({
        success: false,
        message: 'Order ID mismatch'
      });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log('Signature verification:', {
      isAuthentic,
      bodyString: body,
      expectedSignature: expectedSignature.substring(0, 10) + '...',
      receivedSignature: razorpay_signature.substring(0, 10) + '...'
    });

    if (isAuthentic) {
      console.log('Payment signature verified successfully');
      
      // Payment is authentic, update booking status
      booking.status = 'confirmed';
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      booking.paymentVerifiedAt = new Date();
      booking.updatedAt = new Date();

      await booking.save();
      console.log('Booking status updated to confirmed');

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          status: booking.status,
          razorpayPaymentId: booking.razorpayPaymentId,
          paymentVerifiedAt: booking.paymentVerifiedAt,
          pricing: booking.pricing
        }
      });
      
      console.log('=== PAYMENT VERIFICATION SUCCESS ===');
      
    } else {
      console.log('Payment signature verification failed');
      
      // Signature verification failed - mark as failed but don't delete
      booking.status = 'payment_failed';
      booking.paymentFailedAt = new Date();
      booking.updatedAt = new Date();
      await booking.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed - signature mismatch',
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          status: booking.status
        }
      });
    }
    
  } catch (error) {
    console.error('=== PAYMENT VERIFICATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try to update booking status if we can identify it
    try {
      const { bookingId } = req.body;
      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'pending') {
          booking.status = 'payment_verification_failed';
          booking.updatedAt = new Date();
          await booking.save();
        }
      }
    } catch (updateError) {
      console.error('Failed to update booking status after error:', updateError.message);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

// Get user's bookings with enhanced data
exports.getUserBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user.id);
    
    const { status, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .populate('productId', 'title brand model images pricing location specifications')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalBookings = await Booking.countDocuments(query);

    console.log(`Found ${bookings.length} bookings for user`);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalCount: totalBookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBookings / parseInt(limit)),
      bookings: bookings.map(booking => ({
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        customerInfo: booking.customerInfo,
        pricing: booking.pricing,
        pickupLocation: booking.pickupLocation,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        product: booking.productId
      }))
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single booking details with full information
exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching booking details for:', id);

    const booking = await Booking.findOne({ 
      _id: id, 
      userId: req.user.id 
    }).populate('productId', 'title brand model images specifications location owner pricing description');

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    console.log('Booking found:', booking.bookingId);

    res.status(200).json({
      success: true,
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        quantity: booking.quantity,
        customerInfo: booking.customerInfo,
        pickupLocation: booking.pickupLocation,
        customPickupAddress: booking.customPickupAddress,
        additionalRequests: booking.additionalRequests,
        paymentMethod: booking.paymentMethod,
        pricing: booking.pricing,
        razorpayOrderId: booking.razorpayOrderId,
        razorpayPaymentId: booking.razorpayPaymentId,
        paymentVerifiedAt: booking.paymentVerifiedAt,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        product: booking.productId
      }
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel a booking with validation
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('Cancelling booking:', id, 'for user:', req.user.id);

    const booking = await Booking.findOne({ 
      _id: id, 
      userId: req.user.id 
    });

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      console.log('Cannot cancel booking with status:', booking.status);
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled. Current status: ${booking.status}`,
        currentStatus: booking.status
      });
    }

    // Check cancellation timing (optional - implement based on your business rules)
    const now = new Date();
    const bookingStart = new Date(booking.startDate);
    const hoursUntilStart = (bookingStart - now) / (1000 * 60 * 60);
    
    if (hoursUntilStart < 24) {
      console.log('Cancellation too close to start time:', hoursUntilStart, 'hours');
      // You might want to charge a cancellation fee or restrict cancellation
      // For now, we'll allow it but add a note
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.updatedAt = new Date();
    await booking.save();

    console.log('Booking cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};