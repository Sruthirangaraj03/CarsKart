import React, { useState } from 'react';

const initialPlans = [
  {
    id: 1,
    name: 'Self-Service Monthly',
    price: '₹499',
    amount: 49900,
    duration: 'per month',
    agent: false,
    badge: 'Current Plan',
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
    buttonText: 'Current Plan',
    selected: true,
    popular: false,
  },
  {
    id: 2,
    name: 'Agent Assisted Monthly',
    price: '₹899',
    amount: 89900,
    duration: 'per month',
    agent: true,
    badge: 'Most Popular',
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
    buttonText: 'Subscribe',
    selected: false,
    popular: true,
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
      'Significant cost savings',
      'Unlimited annual bookings',
      'Extended vehicle warranty',
      'Priority customer support',
      'Flexible cancellation policy'
    ],
    description: 'Maximum savings for independent renters who plan long-term usage.',
    buttonText: 'Subscribe',
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
    badge: 'Premium',
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
    buttonText: 'Subscribe',
    selected: false,
    popular: false,
  },
];

const PricingPlans = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [isProcessing, setIsProcessing] = useState(false);

  // Utility function to get auth token safely
  const getAuthToken = () => {
    try {
      return window.localStorage ? window.localStorage.getItem('token') : null;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  };

  // Check if Razorpay is available
  const isRazorpayAvailable = () => {
    return typeof window !== 'undefined' && window.Razorpay;
  };

  const handleSubscribe = async (planId) => {
    if (isProcessing) return;
    
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      alert('❌ Plan not found');
      return;
    }

    // Check authentication
    const token = getAuthToken();
    if (!token) {
      alert('🔐 Please login first to subscribe');
      return;
    }

    // Check Razorpay availability
    if (!isRazorpayAvailable()) {
      alert('💳 Payment system is not available. Please try again later.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const res = await fetch('http://localhost:8000/api/payment/create-order', {
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
      console.log('ORDER RESPONSE:', data); // Moved this line AFTER data is defined
      
      if (!data.order || !data.order.id) {
        throw new Error('Invalid order response from server');
      }

      // Razorpay options
      const options = {
        key: 'rzp_test_Xi1C8LPB0tGra8',
        amount: data.order.amount,
        currency: 'INR',
        name: 'CarsKart',
        description: selectedPlan.name,
        order_id: data.order.id,
        handler: async function (response) {
          // Validate response
          if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
            alert('❌ Invalid payment response');
            setIsProcessing(false);
            return;
          }

          // Construct verification data
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };

          try {
            // Verify payment
            const verifyRes = await fetch('http://localhost:8000/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(verifyData)
            });

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json().catch(() => ({}));
              throw new Error(errorData.message || 'Payment verification failed');
            }

            const verifyResult = await verifyRes.json();
            console.log('Payment verification result:', verifyResult);
            
            // Store payment success in database
            try {
              const storeRes = await fetch('http://localhost:8000/api/payment/store-subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  planId: selectedPlan.id,
                  planName: selectedPlan.name,
                  amount: selectedPlan.amount,
                  duration: selectedPlan.duration,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  subscriptionStatus: 'active'
                })
              });

              if (!storeRes.ok) {
                console.error('Failed to store subscription in database');
              } else {
                console.log('Subscription stored successfully in database');
              }
            } catch (dbError) {
              console.error('Database storage error:', dbError);
            }
            
            // Handle successful verification
            alert('✅ Payment Successful! Your subscription is now active.');
            
            // Update UI state
            setPlans(prevPlans =>
              prevPlans.map(plan => ({
                ...plan,
                selected: plan.id === planId,
                buttonText: plan.id === planId ? 'Current Plan' : 'Subscribe',
                badge:
                  plan.id === planId
                    ? 'Current Plan'
                    : plan.id === 2
                    ? 'Most Popular'
                    : plan.id === 3
                    ? 'Best Value'
                    : plan.id === 4
                    ? 'Premium'
                    : plan.badge
              }))
            );

          } catch (error) {
            console.error('Payment verification error:', error);
            alert(`⚠️ Payment verification failed: ${error.message}`);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        theme: {
          color: '#F97316'
        }
      };

      // Open Razorpay checkout
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

  return (
    <div className="py-8 px-4 bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Perfect Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Whether you prefer self-service or full agent assistance, we have the right plan for your car rental needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              plan.selected
                ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-white'
                : 'border-gray-200 bg-white hover:border-orange-300'
            } ${plan.popular ? 'ring-4 ring-orange-200' : ''} p-6 flex flex-col justify-between group overflow-hidden h-full min-h-[600px]`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{plan.name}</h3>
                {(plan.popular || plan.selected || plan.badge) && (
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    plan.popular && !plan.selected
                      ? 'bg-orange-500 text-white'
                      : plan.selected
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-4xl font-bold text-orange-600">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.duration.split(' ')[1]}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
              </div>

              <div className={`flex items-center justify-center mb-6 p-3 rounded-lg ${plan.agent ? 'bg-orange-100' : 'bg-gray-100'} group-hover:bg-orange-50 transition-colors`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${plan.agent ? 'bg-orange-500' : 'bg-gray-500'}`}></div>
                  <span className={`text-sm font-medium ${plan.agent ? 'text-orange-700' : 'text-gray-700'}`}>{plan.agent ? 'Agent Assisted' : 'Self-Service'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm group/item">
                    <span className="mr-3 mt-0.5 text-orange-500 group-hover/item:text-orange-600 transition-colors">✓</span>
                    <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => !plan.selected && !isProcessing && handleSubscribe(plan.id)}
              className={`relative overflow-hidden py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                plan.selected
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 cursor-pointer'
              } group/button`}
              disabled={plan.selected || isProcessing}
            >
              <span className="relative z-10">
                {isProcessing ? 'Processing...' : plan.buttonText}
              </span>
              {!plan.selected && !isProcessing && <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left"></div>}
            </button>

            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Loading overlay when processing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-700">Processing your payment...</p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PricingPlans;