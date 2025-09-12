import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Fuel, 
  Settings, 
  Star, 
  Heart, 
  Car, 
  Clock, 
  Shield,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Camera,
  Share2,
  MessageCircle
} from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching product details for ID:', id);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`https://cars-kart.onrender.com/api/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token,
          'token': token
        }
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Product data received:', data);
      
      if (data.success && data.product) {
        setProduct(data.product);
        console.log('✅ Product loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format location
  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Location not specified';
    }
    
    const { address, city, state, pincode, landmark } = location;
    const parts = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    
    return parts.join(', ') || 'Location not specified';
  };

  // Helper function to get image URL
  const getImageUrl = (product, index = 0) => {
    if (product?.images?.gallery?.[index]) {
      return `https://cars-kart.onrender.com${product.images.gallery[index]}`;
    }
    if (product?.images?.primary) {
      return `https://cars-kart.onrender.com${product.images.primary}`;
    }
    return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop';
  };

  const getAllImages = (product) => {
    const images = [];
    if (product?.images?.gallery?.length > 0) {
      product.images.gallery.forEach(img => {
        images.push(`https://cars-kart.onrender.com${img}`);
      });
    } else if (product?.images?.primary) {
      images.push(`https://cars-kart.onrender.com${product.images.primary}`);
    } else {
      images.push('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop');
    }
    return images;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-25">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">Cars</span>
                  <span className="text-2xl font-bold text-orange-500">Kart</span>
                </div>
              </div>
              
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-200 rounded-3xl h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-25 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/rental-deals')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Back to Rental Deals
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = getAllImages(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-25">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Cars</span>
                <span className="text-2xl font-bold text-orange-500">Kart</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl">
              <img 
                src={images[selectedImage]}
                alt={product.title || 'Car'}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg text-white ${
                  product.availability?.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {product.availability?.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-sm border">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">{product.rating || '4.5'}</span>
                  <span className="text-gray-500">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-orange-500 shadow-lg' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <img 
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.title || `${product.brand || ''} ${product.model || 'Car'}`.trim() || 'Car Name'}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                <span className="text-lg">{formatLocation(product.location)}</span>
              </div>

              {product.adminId?.name && (
                <div className="flex items-center text-gray-500 mb-6">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Hosted by <span className="font-semibold text-gray-700">{product.adminId.name}</span></span>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-600">
                      ₹{product.pricing?.daily || product.pricePerDay || '999'}
                    </div>
                    <div className="text-orange-700 font-medium">per day</div>
                  </div>
                  {product.pricing?.hourly && (
                    <div className="text-right">
                      <div className="text-xl font-semibold text-orange-600">
                        ₹{product.pricing.hourly}
                      </div>
                      <div className="text-orange-700 text-sm">per hour</div>
                    </div>
                  )}
                </div>
                {product.pricing?.securityDeposit && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="text-sm text-orange-700">
                      Security Deposit: <span className="font-semibold">₹{product.pricing.securityDeposit}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Fuel Type</div>
                      <div className="text-gray-600">{product.specifications?.fuelType || 'Petrol'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Seating</div>
                      <div className="text-gray-600">{product.specifications?.seatingCapacity || '5'} Seats</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Transmission</div>
                      <div className="text-gray-600">{product.specifications?.transmission || 'Manual'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Mileage</div>
                      <div className="text-gray-600">{product.specifications?.mileage || '15'} km/l</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, index) => (
                    <span 
                      key={index} 
                      className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  product.availability?.isAvailable 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!product.availability?.isAvailable}
                onClick={() => setShowBookingModal(true)}
              >
                {product.availability?.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 border border-gray-200">
                <MessageCircle className="w-5 h-5" />
                Contact Host
              </button>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description provided for this vehicle.'}
            </p>
          </div>

          {/* Host Info */}
          {product.adminId && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Host Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {product.adminId.name?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.adminId.name}</div>
                    <div className="text-gray-500 text-sm">Verified Host</div>
                  </div>
                </div>
                
                {product.adminId.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{product.adminId.email}</span>
                  </div>
                )}
                
                {product.adminId.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{product.adminId.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Feature</h3>
              <p className="text-gray-600 mb-6">
                This is a demo. In a real application, this would open a booking form with date selection, payment options, and confirmation.
              </p>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;