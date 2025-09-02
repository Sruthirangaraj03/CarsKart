import React, { useState, useEffect } from 'react';
import { CheckCircle, Car, User, Phone, Mail, MapPin, Calendar, Star, Shield, Award, Clock } from 'lucide-react';

const BookingSuccessPage = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Get booking ID from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId') || localStorage.getItem('currentBookingId');
        
        if (!bookingId) {
          throw new Error('Booking ID not found');
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch booking details from your backend
        const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Booking data received:', data);

        setBookingDetails(data.booking);
        
        // Fetch owner details using the product/car owner info
        if (data.booking && data.booking.productId) {
          await fetchOwnerDetails(data.booking.productId, token);
        }

      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchOwnerDetails = async (productId, token) => {
      try {
        // Fetch product details to get owner info
        const productResponse = await fetch(`http://localhost:8000/api/products/${productId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (productResponse.ok) {
          const productData = await productResponse.json();
          console.log('Product data received:', productData);
          
          // Extract owner details from product data
          if (productData.product && productData.product.owner) {
            setOwnerDetails(productData.product.owner);
          }
        }
      } catch (err) {
        console.error('Error fetching owner details:', err);
      }
    };

    fetchBookingDetails();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-orange-600 mt-4 text-center">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error Loading Booking</p>
            <p className="text-sm mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 text-lg">Thank you for choosing CarsKart</p>
            {bookingDetails && (
              <p className="text-orange-600 font-semibold mt-2">
                Booking ID: {bookingDetails.bookingId}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          {bookingDetails && (
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6">
              <div className="flex items-center mb-6">
                <Car className="w-6 h-6 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
              </div>
              
              <div className="space-y-4">
                {bookingDetails.productDetails && (
                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                    {bookingDetails.productDetails.images && bookingDetails.productDetails.images[0] && (
                      <img 
                        src={bookingDetails.productDetails.images[0]} 
                        alt={bookingDetails.productDetails.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {bookingDetails.productDetails.title || 'Car Details'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {bookingDetails.productDetails.brand} {bookingDetails.productDetails.model}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Start Date</p>
                      <p className="text-gray-600">{formatDate(bookingDetails.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">End Date</p>
                      <p className="text-gray-600">{formatDate(bookingDetails.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(bookingDetails.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owner Contact Details */}
          {ownerDetails && (
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Car Owner Details</h2>
              </div>

              <div className="space-y-6">
                {/* Owner Profile */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                    {ownerDetails.profileImage ? (
                      <img 
                        src={ownerDetails.profileImage} 
                        alt={ownerDetails.name}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      {ownerDetails.name || ownerDetails.username}
                      {ownerDetails.verified && (
                        <Shield className="w-5 h-5 text-blue-500 ml-2" />
                      )}
                    </h3>
                    {ownerDetails.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{ownerDetails.rating}</span>
                        <span className="text-sm text-gray-600">({ownerDetails.totalReviews || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  {ownerDetails.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <a 
                          href={`tel:${ownerDetails.phone}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {ownerDetails.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {ownerDetails.email && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <a 
                          href={`mailto:${ownerDetails.email}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {ownerDetails.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {ownerDetails.address && (
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-gray-600 text-sm">{ownerDetails.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {(ownerDetails.responseTime || ownerDetails.memberSince || ownerDetails.totalCars) && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      {ownerDetails.responseTime && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Response Time</span>
                          </div>
                          <span className="text-sm font-medium">{ownerDetails.responseTime}</span>
                        </div>
                      )}
                      
                      {ownerDetails.memberSince && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Member Since</span>
                          </div>
                          <span className="text-sm font-medium">
                            {new Date(ownerDetails.memberSince).getFullYear()}
                          </span>
                        </div>
                      )}
                      
                      {ownerDetails.totalCars && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Total Cars</span>
                          </div>
                          <span className="text-sm font-medium">{ownerDetails.totalCars}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => window.location.href = '/bookings'}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg"
          >
            View All Bookings
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white text-orange-600 border-2 border-orange-500 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Need help? Contact our support team
          </p>
          <div className="flex justify-center space-x-6">
            <a href="tel:+911800000000" className="text-orange-600 hover:text-orange-700 text-sm">
              📞 1800-000-000
            </a>
            <a href="mailto:support@carskart.com" className="text-orange-600 hover:text-orange-700 text-sm">
              ✉️ support@carskart.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;