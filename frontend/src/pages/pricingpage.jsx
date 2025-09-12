import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Badge configuration with unique icons and colors
const BADGE_CONFIG = {
  'Most Popular': { 
    icon: '🔥', 
    bgClass: 'bg-gradient-to-r from-red-500 to-red-600',
    textClass: 'text-white'
  },
  'Premium': { 
    icon: '⭐', 
    bgClass: 'bg-gradient-to-r from-purple-500 to-purple-600',
    textClass: 'text-white'
  },
  'Best Value': { 
    icon: '💎', 
    bgClass: 'bg-gradient-to-r from-green-500 to-green-600',
    textClass: 'text-white'
  },
  'Enterprise': { 
    icon: '👑', 
    bgClass: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    textClass: 'text-white'
  }
};

const initialPlans = [
  {
    id: 1,
    name: 'Self-Service Monthly',
    price: '₹499',
    amount: 49900,
    duration: 'per month',
    agent: false,
    badge: 'Most Popular',
    features: [
      'Perfect for independent renters',
      'You handle car pickup & return', 
      'Self-managed bookings',
      'Basic customer support',
      'Up to 10 bookings per month',
      'Standard vehicle options',
      'Mobile app access'
    ],
    description: 'Ideal for individuals who prefer managing their own car rentals and pickups.',
    buttonText: 'Choose Plan',
    selected: false,
    popular: true,
  },
  {
    id: 2,
    name: 'Agent Assisted Monthly',
    price: '₹899',
    amount: 89900,
    duration: 'per month',
    agent: true,
    badge: 'Premium',
    features: [
      'Dedicated agent support',
      'Door-to-door car delivery',
      'Agent handles pickup from your home',
      'Priority booking assistance',
      'Unlimited monthly bookings',
      'Premium vehicle selection',
      '24/7 agent availability',
      'Concierge service included'
    ],
    description: 'Perfect for busy professionals who want hassle-free car rentals with full service.',
    buttonText: 'Choose Plan',
    selected: false,
    popular: false,
  },
  {
    id: 3,
    name: 'Self-Service Annual',
    price: '₹7,999',
    amount: 799900,
    duration: 'per year',
    agent: false,
    badge: 'Best Value',
    features: [
      'Best for long-term independent renters',
      'You manage pickup & return',
      '12-month validity period',
      'Significant cost savings (33% off)',
      'Unlimited annual bookings',
      'Extended vehicle warranty',
      'Priority customer support',
      'Flexible cancellation policy'
    ],
    description: 'Maximum savings for independent renters who plan long-term usage.',
    buttonText: 'Choose Plan',
    selected: false,
    popular: false,
  },
  {
    id: 4,
    name: 'Agent Assisted Annual',
    price: '₹13,999',
    amount: 1399900,
    duration: 'per year',
    agent: true,
    badge: 'Enterprise',
    features: [
      'Full year with dedicated agent',
      'Door-to-door service all year',
      'Agent pickup from your location',
      'VIP priority access',
      'Unlimited premium bookings',
      'Luxury vehicle access',
      'Personal account manager',
      'White-glove service experience'
    ],
    description: 'Ultimate luxury experience with full-service support for the entire year.',
    buttonText: 'Choose Plan',
    selected: false,
    popular: false,
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [plans] = useState(initialPlans);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [isHost, setIsHost] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHostRequiredModal, setShowHostRequiredModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utility function to get auth token safely
  const getAuthToken = () => {
    try {
      return typeof window !== 'undefined' && window.localStorage 
        ? window.localStorage.getItem('token') 
        : null;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  };

  // Check if Razorpay is available
  const isRazorpayAvailable = () => {
    return typeof window !== 'undefined' && window.Razorpay;
  };

  // Enhanced host status check with correct API endpoints
  const checkHostStatus = async (token) => {
    console.log('🔍 Starting comprehensive host status check...');
    
    // First, check localStorage cache
    const cachedHostId = localStorage.getItem('currentHostId');
    const cachedHostStatus = localStorage.getItem('isHost');
    
    if (cachedHostId && cachedHostStatus === 'true') {
      console.log('📋 Found cached host data:', cachedHostId);
      setIsHost(true);
      setHostId(cachedHostId);
      // Still verify with API, but don't block on it
    }

    try {
      // Use the correct primary endpoint
      console.log('🌐 Checking primary host status endpoint...');
      const response = await fetch('https://cars-kart.onrender.com/api/host/check-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Primary endpoint response:', data);
        
        // Check the correct response structure
        if (data.success && data.isHost === true && data.hostData) {
          console.log('✅ User confirmed as host via primary endpoint');
          
          // Extract hostId from correct location
          const hostIdFromApi = data.hostData.id;
          
          if (hostIdFromApi) {
            setIsHost(true);
            setHostId(hostIdFromApi);
            localStorage.setItem('currentHostId', hostIdFromApi);
            localStorage.setItem('isHost', 'true');
            console.log('✅ Host ID set:', hostIdFromApi);
          } else {
            console.error('❌ Host data found but no ID available');
            setIsHost(false);
          }
          return;
        } else {
          console.log('❌ User not a host according to primary endpoint');
          setIsHost(false);
          localStorage.removeItem('currentHostId');
          localStorage.removeItem('isHost');
          return;
        }
      } else {
        console.warn('⚠️ Primary endpoint returned error:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Primary endpoint failed:', error.message);
    }

    // Try correct alternative endpoint (getHostProfile)
    try {
      console.log('🌐 Trying alternative host profile endpoint...');
      const altResponse = await fetch('https://cars-kart.onrender.com/api/host/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('📋 Alternative endpoint response:', altData);
        
        // Handle getHostProfile response structure
        if (altData && altData._id) {
          console.log('✅ User confirmed as host via profile endpoint');
          const hostIdFromAlt = altData._id;
          setIsHost(true);
          setHostId(hostIdFromAlt);
          localStorage.setItem('currentHostId', hostIdFromAlt);
          localStorage.setItem('isHost', 'true');
          return;
        }
      } else if (altResponse.status === 404) {
        console.log('❌ No host profile found - user is not a host');
        setIsHost(false);
        localStorage.removeItem('currentHostId');
        localStorage.removeItem('isHost');
        return;
      }
    } catch (error) {
      console.warn('⚠️ Alternative endpoint failed:', error.message);
    }

    // If both APIs failed but we have cached data, use it with warning
    if (cachedHostId && cachedHostStatus === 'true') {
      console.log('📋 Using cached host data as fallback');
      setIsHost(true);
      setHostId(cachedHostId);
      return;
    }

    // No host status found anywhere
    console.log('❌ No host status found - user is not a host');
    setIsHost(false);
    setHostId(null);
    localStorage.removeItem('currentHostId');
    localStorage.removeItem('isHost');
  };

  // FIXED: Main user status check WITHOUT auto-redirect
  useEffect(() => {
    const checkUserStatus = async () => {
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        console.log('🔐 No token found - user not logged in');
        setIsLoading(false);
        return;
      }

      try {
        // Check host status first
        await checkHostStatus(token);

        // Fetch user data for payment prefill
        try {
          const userRes = await fetch('https://cars-kart.onrender.com/api/auth/me', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            console.log('👤 User data fetched successfully');
            setUser(userData);
          } else if (userRes.status === 401) {
            console.log('🔐 Token expired - clearing and redirecting');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
        } catch (userError) {
          console.warn('⚠️ User data fetch failed:', userError.message);
        }

        // REMOVED: Auto-redirect logic that was preventing back/forth navigation
        // Now users can freely navigate between pricing and dashboard

      } catch (error) {
        console.error('❌ Critical error in user status check:', error);
        setError('Unable to verify account status. Some features may not work properly.');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  // Handle dashboard navigation
  const handleGoToDashboard = () => {
    console.log('🏠 Navigating to dashboard, hostId:', hostId);
    
    const currentHostId = hostId || localStorage.getItem('currentHostId');
    
    if (!currentHostId) {
      console.error('❌ No hostId available for dashboard navigation');
      alert('Unable to access dashboard. Please try refreshing the page.');
      return;
    }

    navigate(`/host-dashboard?hostId=${currentHostId}`);
  };

  // Handle become host action with clear logic
  const handleBecomeHost = () => {
    const token = getAuthToken();
    
    console.log('🚀 handleBecomeHost called, isHost:', isHost, 'hostId:', hostId);

    if (!token) {
      console.log('🔐 No token, redirecting to login');
      navigate('/login');
      return;
    }

    // Check current status from both state and localStorage
    const stateIsHost = isHost === true;
    const cachedIsHost = localStorage.getItem('isHost') === 'true';
    const currentHostId = hostId || localStorage.getItem('currentHostId');

    if ((stateIsHost || cachedIsHost) && currentHostId) {
      console.log('✅ User is confirmed host, navigating to dashboard...');
      handleGoToDashboard();
    } else {
      console.log('❌ User is not a host, showing subscription modal...');
      setShowHostRequiredModal(true);
    }
  };

  // Handle plan subscription
  const handleSubscribe = async (planId) => {
    if (isProcessing) return;
    
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      alert('❌ Plan not found');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('🔐 Please login first to subscribe');
      navigate('/login');
      return;
    }

    if (!isRazorpayAvailable()) {
      alert('💳 Payment system is not available. Please try again later.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment order
      const res = await fetch('https://cars-kart.onrender.com/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: selectedPlan.amount })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      console.log('Order created successfully:', data.order);

      // Step 2: Configure Razorpay options
      const options = {
        key: 'rzp_test_Xi1C8LPB0tGra8',
        amount: data.order.amount,
        currency: 'INR',
        name: 'CarsKart',
        description: `${selectedPlan.name} - Host Subscription`,
        order_id: data.order.id,
        handler: async function (response) {
          await handlePaymentSuccess(response, selectedPlan, token);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
          }
        },
        theme: {
          color: '#F97316'
        },
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        }
      };

      // Step 3: Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`❌ Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsProcessing(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      alert(`❌ Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  // Handle successful payment with correct response structure
  const handlePaymentSuccess = async (response, selectedPlan, token) => {
    if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
      alert('❌ Invalid payment response');
      setIsProcessing(false);
      return;
    }

    const verifyData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      amount: selectedPlan.amount,
      planId: selectedPlan.id,
    };

    try {
      const verifyRes = await fetch('https://cars-kart.onrender.com/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(verifyData)
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({}));
        console.error('❌ Payment verification failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Payment verification failed');
      }

      const verifyResult = await verifyRes.json();
      console.log('✅ Payment verification successful:', verifyResult);

      // Handle correct response structure from payment verification
      if (verifyResult.success && verifyResult.data?.isHost) {
        const newHostId = verifyResult.data.hostId;
        
        if (!newHostId) {
          console.error('❌ Payment successful but no hostId returned');
          alert('⚠️ Payment successful but host setup incomplete. Please contact support.');
          return;
        }

        // Update state and localStorage
        setIsHost(true);
        setHostId(newHostId);
        localStorage.setItem("currentHostId", newHostId);
        localStorage.setItem("isHost", "true");
        
        // Set success modal data
        setPaymentSuccess({
          plan: selectedPlan,
          paymentId: response.razorpay_payment_id,
          amount: selectedPlan.amount / 100,
          hostId: newHostId,
        });
        
        // Show success modal and hide host required modal
        setShowSuccessModal(true);
        setShowHostRequiredModal(false);

        console.log('✅ Payment complete - Host ID:', newHostId);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate(`/host-dashboard?hostId=${newHostId}`);
        }, 3000);
      } else {
        console.error('❌ Payment verification succeeded but host setup failed:', verifyResult);
        alert('⚠️ Payment processed but host setup incomplete. Please contact support.');
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      alert(`⚠️ Payment verification failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Host Required Modal Component
  const HostRequiredModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-6 rounded-t-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Host Access Required</h3>
              <p className="text-slate-200 text-sm opacity-90">Choose a plan to become a verified host</p>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Host Membership Required</h4>
                  <p className="text-slate-600 text-xs">Access the dashboard and upload vehicles</p>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed ml-11">
                Only verified hosts can upload vehicles and access the admin dashboard. Choose a hosting plan below to get started.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transform hover:scale-[1.02] transition-all duration-200 shadow-sm"
              >
                Choose a Hosting Plan
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal Component
  const SuccessModal = ({ show, onClose, paymentData }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Welcome to CarsKart Host Community!</h3>
            <p className="text-gray-600">Your payment was successful and you're now a verified host.</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">Plan Activated</div>
            <div className="font-bold text-xl text-orange-600 mb-1">{paymentData?.plan.name}</div>
            <div className="text-sm text-gray-500 mb-2">{paymentData?.plan.price} {paymentData?.plan.duration}</div>
            <div className="text-xs text-gray-400">Payment ID: {paymentData?.paymentId}</div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              🏠 Go to Host Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state with host status check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Checking your account status...</p>
          <p className="text-gray-500 text-sm">Loading host membership details...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2 max-w-md">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* FIXED: Single Dashboard Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-center gap-4">
          {/* Single Main Action Button */}
          <button
            onClick={handleBecomeHost}
            className={`relative overflow-hidden px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isHost 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
            } group`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isHost ? (
                <>
                 
                  <span>Go to Dashboard</span>
                </>
              ) : (
                <>
                  <span>Become a Host</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>

        {/* Host Status Indicator */}
        {isHost && (
          <div className="flex justify-center mt-4">
            <div className="bg-green-100 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
              <div className=" animate-pulse"></div>
              <span className="text-green-700 text-sm font-medium">Verified Host</span>
            </div>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Start Your Journey as a <span className="text-orange-600">Car Host</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Choose the perfect plan that fits your style. Whether you prefer managing everything yourself or want full agent support, we've got you covered.
        </p>
        
        {/* Benefits Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-xl mb-2">💰</div>
            <h3 className="font-medium text-gray-800 mb-1">Earn More</h3>
            <p className="text-sm text-gray-600">Make money from your unused car</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-xl mb-2">🛡️</div>
            <h3 className="font-medium text-gray-800 mb-1">Fully Insured</h3>
            <p className="text-sm text-gray-600">Complete coverage for your vehicle</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-xl mb-2">📱</div>
            <h3 className="font-medium text-gray-800 mb-1">Easy Management</h3>
            <p className="text-sm text-gray-600">Control everything from our app</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mb-10">
        {plans.map((plan) => {
          const badgeConfig = BADGE_CONFIG[plan.badge] || BADGE_CONFIG['Most Popular'];
          
          return (
            <div
              key={plan.id}
              className="relative rounded-xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-gray-200 bg-white hover:border-orange-300 p-6 flex flex-col justify-between group overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg z-10 ${badgeConfig.bgClass} ${badgeConfig.textClass}`}>
                  <span className="text-sm">{badgeConfig.icon}</span>
                  <span>{plan.badge}</span>
                </div>
              )}

              <div className="relative z-10 flex-1 flex flex-col pt-8">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-orange-600">{plan.price}</span>
                    <span className="text-gray-500 ml-1 text-sm">/{plan.duration.split(' ')[1]}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                </div>

                {/* Service Type Indicator */}
                <div className={`flex items-center justify-center mb-4 p-3 rounded-lg ${
                  plan.agent 
                    ? 'bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200' 
                    : 'bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'
                } group-hover:shadow-md transition-all`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${plan.agent ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                    <span className={`font-medium text-xs ${plan.agent ? 'text-purple-700' : 'text-blue-700'}`}>
                      {plan.agent ? '👨‍💼 Agent Assisted' : '🔧 Self-Service'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-xs group/item">
                      <span className="mr-2 mt-0.5 text-green-500 group-hover/item:text-green-600 transition-colors flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}  
              <button
                onClick={() => !isProcessing && handleSubscribe(plan.id)}
                className={`relative overflow-hidden py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 transform ${
                  isProcessing
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 hover:shadow-xl active:scale-95 cursor-pointer'
                } group/button`}
                disabled={isProcessing}
              >
                <span className="relative z-10">
                  {isProcessing ? 'Processing...' : plan.buttonText}
                </span>
                {!isProcessing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left"></div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Payment</h3>
            <p className="text-gray-600 text-sm">Please don't close this window...</p>
          </div>
        </div>
      )}

      {/* Host Required Modal */}
      <HostRequiredModal 
        show={showHostRequiredModal} 
        onClose={() => setShowHostRequiredModal(false)}
      />

      {/* Success Modal */}
      <SuccessModal 
        show={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        paymentData={paymentSuccess}
      />
    </div>
  );
};

export default PricingPage;

