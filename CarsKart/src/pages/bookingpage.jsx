import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Car, CreditCard, 
  User, Phone, Mail, Shield, CheckCircle, AlertCircle,
  Info, Plus, Minus, Star, Fuel, Users, Settings, Award,
  FileText, Lock, Timer, Zap, DollarSign, X, PartyPopper,
  Heart, MessageCircle
} from 'lucide-react';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from product details
  const { productId, product, quantity: initialQuantity } = location.state || {};
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    lastRequest: null,
    lastResponse: null,
    lastError: null,
    timestamp: null
  });
  
  // Form state
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '18:00',
    quantity: initialQuantity || 1,
    customerInfo: {
      fullName: '',
      phone: '',
      email: '',
      drivingLicense: '',
      address: ''
    },
    pickupLocation: 'owner_location',
    customPickupAddress: '',
    additionalRequests: '',
    paymentMethod: 'razorpay'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Calculate dates
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setBookingData(prev => ({
      ...prev,
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0]
    }));
  }, []);

  // Redirect if no product data
  useEffect(() => {
    if (!product || !productId) {
      console.warn('No product data found, redirecting...');
      navigate('/rental-deals');
    }
  }, [product, productId, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        // Check if Razorpay is already loaded
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !bookingConfirmation) return null;

    const customerName = bookingData.customerInfo.fullName.split(' ')[0] || 'Valued Customer';

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto transform animate-bounce-in overflow-hidden">
          {/* Header with celebration background */}
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-white fill-current" />
                <p className="text-white/90 text-sm">Thank you for choosing us</p>
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thank you, {customerName}!
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your booking has been successfully confirmed. We're excited to serve you with our premium vehicle rental service.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Booking ID</span>
                <span className="font-bold text-gray-900">{bookingConfirmation.bookingId}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Vehicle</span>
                <span className="font-semibold text-gray-900 text-sm">{product.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Paid</span>
                <span className="font-bold text-green-600">₹{bookingConfirmation.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Email notification info */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Email Confirmation</span>
              </div>
              <p className="text-blue-700 text-sm">
                Detailed booking information and instructions have been sent to{' '}
                <span className="font-semibold">{bookingData.customerInfo.email}</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/bookings');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                View My Bookings
              </button>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/rental-deals');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold transition-all duration-300"
              >
                Book Another Vehicle
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/bookings');
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Calculate total cost with better validation
  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate || !product) return {
      days: 1,
      dailyRate: 0,
      subtotal: 0,
      taxes: 0,
      insurance: 0,
      securityDeposit: 0,
      total: 0
    };
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    // Better fallback handling for pricing
    const dailyRate = product.pricing?.daily || product.pricePerDay || 500;
    const securityDeposit = product.pricing?.securityDeposit || Math.max(1000, dailyRate * 2);
    const totalRental = dailyRate * days;
    const taxes = Math.round(totalRental * 0.18); // 18% GST
    const insurance = Math.round(totalRental * 0.05); // 5% insurance
    
    return {
      days,
      dailyRate,
      subtotal: totalRental,
      taxes,
      insurance,
      securityDeposit,
      total: totalRental + taxes + insurance + securityDeposit
    };
  };

  const costs = calculateTotal();

  // Handle form changes
  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setBookingData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!bookingData.startDate) newErrors.startDate = 'Start date is required';
    if (!bookingData.endDate) newErrors.endDate = 'End date is required';
    if (!bookingData.customerInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!bookingData.customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!bookingData.customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (!bookingData.customerInfo.drivingLicense.trim()) newErrors.drivingLicense = 'Driving license is required';
    
    // Date validation
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) newErrors.startDate = 'Start date cannot be in the past';
    if (end <= start) newErrors.endDate = 'End date must be after start date';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingData.customerInfo.email && !emailRegex.test(bookingData.customerInfo.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (bookingData.customerInfo.phone && !phoneRegex.test(bookingData.customerInfo.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
    }

    // Pricing validation
    if (!costs.total || costs.total <= 0) {
      newErrors.pricing = 'Invalid pricing calculation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced Razorpay payment handler
  const handleRazorpayPayment = (orderData) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please refresh the page and try again.'));
        return;
      }

      // Get Razorpay key from environment or use a test key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        reject(new Error('Razorpay configuration error. Please contact support.'));
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Vehicle Rental Service',
        description: `Booking for ${product.title}`,
        image: '/logo192.png',
        order_id: orderData.id,
        handler: function (response) {
          console.log('Payment successful:', response);
          resolve({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: bookingData.customerInfo.fullName,
          email: bookingData.customerInfo.email,
          contact: bookingData.customerInfo.phone,
        },
        notes: {
          booking_id: `BK${Date.now()}`,
          product_id: product._id || productId,
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            reject(new Error('Payment cancelled by user'));
          },
          confirm_close: true
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          reject(new Error(`Payment failed: ${response.error.description}`));
        });

        rzp.open();
      } catch (error) {
        console.error('Error opening Razorpay:', error);
        reject(new Error('Failed to open payment gateway'));
      }
    });
  };

  // Enhanced booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== BOOKING SUBMISSION START ===');
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      alert('Please fix the form errors before proceeding.');
      return;
    }
    
    setLoading(true);
    setPaymentLoading(true);
    
    try {
      // Enhanced auth token retrieval
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Please log in to continue with booking');
      }
      
      console.log('Auth token found:', !!token);
      
      // Validate required data
      if (!product || !product._id) {
        throw new Error('Product information is missing. Please go back and select the product again.');
      }
      
      if (!costs.total || costs.total <= 0) {
        throw new Error('Invalid pricing calculation. Please refresh and try again.');
      }

      // Enhanced booking payload with validation
      const bookingPayload = {
        productId: product._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        quantity: parseInt(bookingData.quantity) || 1,
        customerInfo: {
          fullName: bookingData.customerInfo.fullName.trim(),
          email: bookingData.customerInfo.email.toLowerCase().trim(),
          phone: bookingData.customerInfo.phone.trim(),
          drivingLicense: bookingData.customerInfo.drivingLicense.trim(),
          address: bookingData.customerInfo.address.trim()
        },
        pickupLocation: bookingData.pickupLocation === 'owner_location' 
          ? `${product.location?.address || 'Owner Location'}, ${product.location?.city || ''}`
          : bookingData.customPickupAddress,
        customPickupAddress: bookingData.pickupLocation === 'custom' ? bookingData.customPickupAddress : '',
        additionalRequests: bookingData.additionalRequests.trim(),
        paymentMethod: bookingData.paymentMethod,
        pricing: {
          basePrice: costs.dailyRate,
          subtotal: costs.subtotal,
          taxes: costs.taxes,
          insurance: costs.insurance,
          securityDeposit: costs.securityDeposit,
          total: costs.total
        }
      };
      
      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));
      
      // Update debug info
      setDebugInfo({
        lastRequest: bookingPayload,
        lastResponse: null,
        lastError: null,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('Making request to:', '/api/bookings/create-order');
      
      // Step 1: Create booking and Razorpay order with enhanced error handling
      const createOrderResponse = await fetch('/api/bookings/create-order', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bookingPayload)
      });
      
      console.log('Response status:', createOrderResponse.status);
      console.log('Response ok:', createOrderResponse.ok);
      
      let orderData;
      try {
        const responseText = await createOrderResponse.text();
        console.log('Raw response:', responseText);
        
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        
        orderData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response. Please try again.');
      }
      
      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        lastResponse: orderData,
        timestamp: new Date().toISOString()
      }));
      
      console.log('Parsed response:', orderData);
      
      if (!createOrderResponse.ok) {
        const errorMessage = orderData?.message || orderData?.error || `Server error: ${createOrderResponse.status}`;
        console.error('Server error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Enhanced response validation
      if (!orderData.success) {
        throw new Error(orderData.message || 'Order creation failed');
      }
      
      if (!orderData.razorpayOrder || !orderData.razorpayOrder.id) {
        console.error('Invalid razorpay order data:', orderData.razorpayOrder);
        throw new Error('Invalid payment order data received');
      }
      
      console.log('Order created successfully:', orderData.booking?.bookingId);
      setPaymentLoading(false);

      // Step 2: Open Razorpay checkout with enhanced error handling
      try {
        console.log('Opening Razorpay checkout...');
        const paymentResult = await handleRazorpayPayment(orderData.razorpayOrder);
        console.log('Payment completed:', paymentResult);
        
        setPaymentLoading(true);
        
        // Step 3: Verify payment with enhanced validation
        const verifyPayload = {
          bookingId: orderData.booking._id,
          ...paymentResult
        };
        
        console.log('Verifying payment with:', verifyPayload);
        
        const verifyResponse = await fetch('/api/bookings/verify-payment', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(verifyPayload)
        });
        
        const verifyData = await verifyResponse.json();
        console.log('Verification response:', verifyData);
        
        if (verifyResponse.ok && verifyData.success) {
          console.log('Booking confirmed successfully');
          
          // Set booking confirmation data and show success modal
          setBookingConfirmation({
            bookingId: orderData.booking.bookingId || `BK${Date.now()}`,
            totalAmount: costs.total,
            customerEmail: bookingData.customerInfo.email,
            vehicleTitle: product.title
          });
          
          setShowSuccessModal(true);
          
        } else {
          throw new Error(verifyData.message || 'Payment verification failed');
        }
        
      } catch (paymentError) {
        console.error('Payment error:', paymentError);
        
        let errorMessage = 'Payment failed. ';
        if (paymentError.message.includes('cancelled')) {
          errorMessage += 'Payment was cancelled. You can try again.';
        } else if (paymentError.message.includes('failed')) {
          errorMessage += paymentError.message;
        } else {
          errorMessage += 'Please try again or contact support if the issue persists.';
        }
        
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error('=== BOOKING ERROR ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Enhanced error messaging
      let errorMessage = 'Booking failed. ';
      
      if (error.message.includes('log in')) {
        errorMessage = 'Please log in to continue with booking.';
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', { state: { from: location.pathname } });
        }, 2000);
      } else if (error.message.includes('Product information is missing')) {
        errorMessage = 'Product data is missing. Please go back and select the product again.';
      } else if (error.message.includes('Invalid pricing')) {
        errorMessage = 'Pricing calculation error. Please refresh and try again.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  // Early return if no product data
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading booking details...</p>
          <p className="text-gray-500 text-sm mt-2">If this takes too long, please go back and select the product again.</p>
          <button 
            onClick={() => navigate('/rental-deals')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back to Products
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Rental Details', icon: Calendar },
    { id: 2, name: 'Personal Info', icon: User },
    { id: 3, name: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Success Modal */}
      <SuccessModal />
      
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-gray-600 hover:text-orange-600 font-medium transition-all duration-300 group"
            >
              <div className="p-2.5 rounded-full bg-gray-100 group-hover:bg-orange-50 group-hover:scale-105 transition-all duration-300">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="hidden sm:block">Back to Vehicle</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Debug Info Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && debugInfo.lastRequest && (
          <div className="mb-8 bg-gray-900 text-white p-4 rounded-lg text-xs overflow-auto max-h-96">
            <h3 className="text-yellow-400 font-bold mb-2">Debug Information:</h3>
            <div className="space-y-2">
              <div>
                <span className="text-blue-400">Last Request:</span>
                <pre>{JSON.stringify(debugInfo.lastRequest, null, 2)}</pre>
              </div>
              {debugInfo.lastResponse && (
                <div>
                  <span className="text-green-400">Last Response:</span>
                  <pre>{JSON.stringify(debugInfo.lastResponse, null, 2)}</pre>
                </div>
              )}
              {debugInfo.lastError && (
                <div>
                  <span className="text-red-400">Last Error:</span>
                  <pre>{JSON.stringify(debugInfo.lastError, null, 2)}</pre>
                </div>
              )}
              <div>
                <span className="text-purple-400">Timestamp:</span> {debugInfo.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-3 ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-orange-600' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enhanced Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Form Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  Complete Your Booking
                </h1>
                <p className="text-gray-300">Secure your perfect ride with instant payment</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Rental Period Section */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Rental Period</h3>
                        <p className="text-gray-600 text-sm">When do you need the vehicle?</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Start Date *</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                              errors.startDate 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-orange-400'
                            } focus:outline-none focus:ring-4 focus:ring-orange-100`}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <Calendar className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.startDate && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.startDate}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">End Date *</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={bookingData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                              errors.endDate 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-orange-400'
                            } focus:outline-none focus:ring-4 focus:ring-orange-100`}
                            min={bookingData.startDate}
                          />
                          <Calendar className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.endDate && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.endDate}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Pickup Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={bookingData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                          />
                          <Timer className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Return Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={bookingData.endTime}
                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                          />
                          <Timer className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information Section */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Customer Information</h3>
                        <p className="text-gray-600 text-sm">Required for verification and payment</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bookingData.customerInfo.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value, 'customerInfo')}
                            className={`w-full p-4 pl-12 rounded-xl border-2 transition-all duration-300 ${
                              errors.fullName 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-blue-400'
                            } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                            placeholder="Enter your full legal name as per ID"
                          />
                          <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.fullName && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fullName}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={bookingData.customerInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value, 'customerInfo')}
                            className={`w-full p-4 pl-12 rounded-xl border-2 transition-all duration-300 ${
                              errors.phone 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-blue-400'
                            } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                            placeholder="9876543210"
                            maxLength="10"
                          />
                          <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.phone && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phone}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={bookingData.customerInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value, 'customerInfo')}
                            className={`w-full p-4 pl-12 rounded-xl border-2 transition-all duration-300 ${
                              errors.email 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-blue-400'
                            } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                            placeholder="your.email@example.com"
                          />
                          <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.email && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Driving License Number *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bookingData.customerInfo.drivingLicense}
                            onChange={(e) => handleInputChange('drivingLicense', e.target.value, 'customerInfo')}
                            className={`w-full p-4 pl-12 rounded-xl border-2 transition-all duration-300 ${
                              errors.drivingLicense 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-blue-400'
                            } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                            placeholder="Enter your driving license number"
                          />
                          <CreditCard className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.drivingLicense && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.drivingLicense}
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Complete Address</label>
                        <textarea
                          value={bookingData.customerInfo.address}
                          onChange={(e) => handleInputChange('address', e.target.value, 'customerInfo')}
                          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
                          rows="3"
                          placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Requests Section */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Additional Requests
                  </h3>
                  <textarea
                    value={bookingData.additionalRequests}
                    onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 resize-none"
                    rows="4"
                    placeholder="Any special requirements: preferred fuel level, child seats, GPS navigation, etc."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5" />
                          <span>Pay ₹{costs.total?.toLocaleString()} & Confirm Booking</span>
                          <Zap className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </button>
                  
                  <p className="text-center text-gray-500 text-sm mt-3">
                    Your payment is secure and encrypted
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Enhanced Booking Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Vehicle Summary Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative">
                <div className="overflow-hidden">
                  <img
                    src={product.images?.primary ? `http://localhost:8000${product.images.primary}` : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop'}
                    alt={product.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop';
                    }}
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-800">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">{product.title}</h4>
                  <p className="text-gray-600">{product.brand} {product.model} • {product.year}</p>
                </div>
                
                {/* Enhanced Vehicle Specs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { icon: Users, value: `${product.specifications?.seatingCapacity || 4} Seats`, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
                    { icon: Fuel, value: product.specifications?.fuelType || 'Petrol', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700' },
                    { icon: Settings, value: product.specifications?.transmission || 'Manual', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
                    { icon: Star, value: `${product.specifications?.mileage || 15} km/l`, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700' }
                  ].map((spec, index) => (
                    <div key={index} className={`${spec.bgColor} rounded-xl p-3 border border-${spec.color}-200`}>
                      <div className="flex items-center gap-2">
                        <spec.icon className={`w-4 h-4 ${spec.textColor}`} />
                        <span className={`text-sm font-medium ${spec.textColor}`}>{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Owner Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {product.owner?.name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Hosted by {product.owner?.name || 'Owner'}</p>
                      <p className="text-xs text-gray-600">Verified host • Quick response</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Cost Breakdown */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Pricing Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Rental Duration</span>
                  </div>
                  <span className="font-bold text-gray-900">{costs.days} day{costs.days > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Daily Rate</span>
                  <span className="font-semibold text-gray-900">₹{costs.dailyRate?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Rental Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{costs.subtotal?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">GST (18%)</span>
                  <span className="font-semibold text-gray-900">₹{costs.taxes?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Insurance (5%)</span>
                  <span className="font-semibold text-gray-900">₹{costs.insurance?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Security Deposit</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{costs.securityDeposit?.toLocaleString()}</span>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border-2 border-orange-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Total Amount</span>
                    </div>
                    <span className="font-bold text-2xl text-orange-600">₹{costs.total?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-orange-700 mt-2">*Security deposit refundable on return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Loading Overlay */}
        {paymentLoading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-bold text-gray-900 mb-2">Preparing Payment</h3>
              <p className="text-gray-600">Setting up secure checkout...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animation keyframes in a style tag */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default BookingPage;