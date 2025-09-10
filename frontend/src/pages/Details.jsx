import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Heart, Users, Fuel, Settings, 
  Car, Clock, Shield, Eye, ChevronLeft, ChevronRight,
  Phone, Mail, Calendar, CreditCard, Award, Sparkles,
  CheckCircle, Info, Plus, Minus, MessageCircle
} from 'lucide-react';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        setProduct(data.product);
      } else {
        throw new Error(data.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8000/api/reviews/product/${productId}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        console.error('Reviews fetch failed:', response.status);
        setReviews([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    }
  };

  const handleReviewSubmit = async () => {
    if (!comment.trim() || rating === 0) {
      alert("Please provide both a comment and rating");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to submit a review");
      navigate('/login');
      return;
    }

    setReviewLoading(true);

    try {
      let response;
      let url;
      
      if (editingId) {
        url = `http://localhost:8000/api/reviews/${editingId}`;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            comment: comment.trim(), 
            rating: rating
          })
        });
      } else {
        url = `http://localhost:8000/api/reviews/${productId}`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            comment: comment.trim(), 
            rating: rating
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setComment("");
      setRating(0);
      setEditingId(null);
      setHover(null);
      
      await fetchReviews();
      
      alert(editingId ? "Review updated successfully!" : "Review added successfully!");
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(`Failed to submit review: ${error.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEdit = (review) => {
    setComment(review.comment);
    setRating(review.rating || review.stars);
    setEditingId(review._id);
    
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to delete reviews");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchReviews();
      alert("Review deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(`Failed to delete review: ${error.message}`);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add to favorites");
        navigate('/login');
        return;
      }

      const response = await fetch("http://localhost:8000/api/favorites/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id })
      });
      
      if (response.ok) {
        setIsFavorite(true);
        alert("Added to favorites!");
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          alert("Product already in favorites!");
        } else {
          alert(`Failed to add to favorites: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites");
    }
  };

  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book a car");
      navigate('/login');
      return;
    }
    
    navigate('/book', { 
      state: { 
        productId: product._id, 
        product: product,
        quantity: quantity 
      }
    });
  };

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Location not specified';
    }
    
    const { address, city, state, pincode } = location;
    const parts = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    
    return parts.join(', ') || 'Location not specified';
  };

  const getAllImages = (product) => {
    const images = [];
    if (product?.images?.gallery?.length > 0) {
      product.images.gallery.forEach(img => {
        images.push(`http://localhost:8000${img}`);
      });
    } else if (product?.images?.primary) {
      images.push(`http://localhost:8000${product.images.primary}`);
    } else {
      images.push('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop');
    }
    return images;
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Anonymous User";
    
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0]; 
    
    return "User";
  };

  const calculateRating = () => {
    if (reviews.length === 0) return 4.5;
    const avg = reviews.reduce((sum, review) => sum + (review.rating || review.stars || 0), 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-orange-600 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Car className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">Vehicle Unavailable</h2>
          <p className="text-red-600 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate('/rental-deals')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Browse Other Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Car className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-orange-800 mb-4">Vehicle Not Found</h2>
          <p className="text-orange-600 mb-8 leading-relaxed">The requested vehicle could not be located in our inventory.</p>
          <button 
            onClick={() => navigate('/rental-deals')}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explore Our Fleet
          </button>
        </div>
      </div>
    );
  }

  const images = getAllImages(product);
  const avgRating = calculateRating();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-orange-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button 
              onClick={() => navigate('/rental-deals')}
              className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Back to Fleet</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToFavorites}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-orange-400 hover:text-red-500 border border-orange-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column - Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative group">
              <div className="overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-orange-100 to-amber-200">
                <img
                  src={images[selectedImage]}
                  alt={product.title || 'Vehicle'}
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop';
                  }}
                />
                
                {/* Floating Badges */}
                <div className="absolute top-6 left-6">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md ${
                    product.availability?.isAvailable 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      product.availability?.isAvailable ? 'bg-emerald-200' : 'bg-red-200'
                    }`}></div>
                    {product.availability?.isAvailable ? 'Available Now' : 'Currently Unavailable'}
                  </div>
                </div>

                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="font-semibold text-orange-800">{avgRating}</span>
                    <span className="text-orange-600 text-sm">({reviews.length})</span>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-orange-700" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-orange-700" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-18 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-orange-500 shadow-lg scale-105' 
                        : 'border-orange-200 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Vehicle Info & Booking */}
          <div className="space-y-6">
            {/* Title & Details */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 mb-3 leading-tight">
                    {product.title || `${product.brand || ''} ${product.model || 'Premium Vehicle'}`.trim()}
                  </h1>
                  <div className="flex items-center text-orange-700 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="text-sm">{formatLocation(product.location)}</span>
                  </div>
                  {product.adminId?.name && (
                    <div className="flex items-center text-orange-600 text-sm">
                      <Shield className="w-4 h-4 mr-2 text-orange-400" />
                      <span>Managed by <strong>{product.adminId.name}</strong></span>
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ₹{product.pricing?.daily || product.pricePerDay || '999'}
                    </span>
                    <span className="text-orange-700 font-medium">per day</span>
                  </div>
                  {product.pricing?.securityDeposit && (
                    <div className="text-sm text-orange-600">
                      Security deposit: <span className="font-semibold">₹{product.pricing.securityDeposit}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-orange-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Reserve Now
                  </h3>
                  <div className="flex items-center bg-orange-50 rounded-full p-1">
                    <button
                      className="p-2 hover:bg-white rounded-full transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4 text-orange-600" />
                    </button>
                    <span className="px-4 py-2 font-semibold text-orange-900">{quantity} day{quantity > 1 ? 's' : ''}</span>
                    <button
                      className="p-2 hover:bg-white rounded-full transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleBookNow}
                    disabled={!product.availability?.isAvailable}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      product.availability?.isAvailable 
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white' 
                        : 'bg-orange-300 text-orange-500 cursor-not-allowed'
                    }`}
                  >
                    {product.availability?.isAvailable ? 'Book Instantly' : 'Currently Unavailable'}
                  </button>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-orange-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Free cancellation within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-orange-100">
              <nav className="flex">
                {[
                  { key: 'overview', label: 'Overview', icon: Eye },
                  { key: 'features', label: 'Features', icon: Sparkles },
                  { key: 'specifications', label: 'Specifications', icon: Award },
                  { key: 'reviews', label: 'Reviews', icon: MessageCircle }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-orange-700 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {product.description && (
                    <div>
                      <h3 className="text-xl font-bold text-orange-900 mb-4">Description</h3>
                      <p className="text-orange-800 leading-relaxed text-lg">{product.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Vehicle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Brand', value: product.brand || 'Premium' },
                        { label: 'Model', value: product.model || 'Luxury' },
                        { label: 'Year', value: product.year || '2023' },
                        { label: 'Color', value: product.color || 'Black' },
                        { label: 'Registration', value: product.registrationNumber || 'Private' },
                        { label: 'Insurance', value: 'Comprehensive' }
                      ].map((detail, index) => (
                        <div key={index} className="bg-orange-50 rounded-xl p-4">
                          <div className="text-sm text-orange-600 font-medium">{detail.label}</div>
                          <div className="text-lg font-semibold text-orange-900">{detail.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h3 className="text-xl font-bold text-orange-900 mb-6">Included Features</h3>
                  {product.features && product.features.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-orange-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {['Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Safety Kit', 'Spare Tire', 'Insurance Coverage', 'Clean Interior', '24/7 Support'].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-orange-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6 text-orange-500" />
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: Users, label: 'Seating Capacity', value: product.specifications?.seatingCapacity || '5 Persons', color: 'blue' },
                      { icon: Fuel, label: 'Fuel Type', value: product.specifications?.fuelType || 'Petrol', color: 'green' },
                      { icon: Settings, label: 'Transmission', value: product.specifications?.transmission || 'Manual', color: 'purple' },
                      { icon: Fuel, label: 'Mileage', value: `${product.specifications?.mileage || '15'} km/l`, color: 'orange' }
                    ].map((spec, index) => (
                      <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <spec.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-sm text-orange-600 font-medium mb-1">{spec.label}</div>
                        <div className="text-lg font-bold text-orange-900">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Professional Review Header */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-orange-600 mb-2">{avgRating}</div>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'text-orange-400 fill-orange-400' : 'text-orange-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-orange-700 font-medium">Overall Rating</p>
                        <p className="text-orange-600 text-sm">{reviews.length} total reviews</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h4 className="text-lg font-bold text-orange-900 mb-4">Rating Distribution</h4>
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = reviews.filter(r => Math.floor(r.rating || r.stars || 0) === star).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-orange-700 w-6">{star}★</span>
                              <div className="flex-1 bg-orange-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full transition-all duration-500"
                                  style={{width: `${percentage}%`}}
                                ></div>
                              </div>
                              <span className="text-sm text-orange-600 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Professional Review Form */}
                  <div className="bg-white rounded-2xl p-8 border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-orange-900">Write a Review</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-orange-800 mb-3">Your Rating</label>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, index) => {
                            const currentRating = index + 1;
                            return (
                              <button
                                key={index}
                                onClick={() => setRating(currentRating)}
                                onMouseEnter={() => !reviewLoading && setHover(currentRating)}
                                onMouseLeave={() => !reviewLoading && setHover(null)}
                                disabled={reviewLoading}
                                className="transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed"
                              >
                                <Star
                                  size={32}
                                  fill={currentRating <= (hover || rating) ? "#f59e0b" : "#fed7aa"}
                                  color={currentRating <= (hover || rating) ? "#f59e0b" : "#fed7aa"}
                                />
                              </button>
                            );
                          })}
                          {rating > 0 && (
                            <span className="text-orange-600 font-semibold ml-3">{rating}/5 Stars</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-orange-800 mb-3">Your Review</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience with this vehicle. What did you like? Any suggestions for improvement?"
                          className="w-full bg-orange-50 p-4 rounded-xl border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent min-h-[140px] resize-none text-orange-900 placeholder-orange-500"
                          disabled={reviewLoading}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-orange-600">{comment.length}/500 characters</span>
                          <div className="flex gap-3">
                            <button
                              onClick={handleReviewSubmit}
                              disabled={reviewLoading || !comment.trim() || rating === 0}
                              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:from-orange-300 disabled:to-amber-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                              {reviewLoading ? "Publishing..." : (editingId ? "Update Review" : "Publish Review")}
                            </button>
                            
                            {editingId && (
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setComment("");
                                  setRating(0);
                                  setHover(null);
                                }}
                                className="bg-orange-200 hover:bg-orange-300 text-orange-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                disabled={reviewLoading}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Reviews List */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-orange-900">Customer Reviews</h4>
                      <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        {reviews.length} Reviews
                      </div>
                    </div>

                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                  {getUserDisplayName(review?.user).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-orange-900 text-lg mb-1">
                                    {getUserDisplayName(review?.user)}
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < (review.rating || review.stars || 0)
                                              ? 'text-orange-400 fill-orange-400'
                                              : 'text-orange-200'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                      {review.rating || review.stars}/5
                                    </span>
                                    <span className="text-sm text-orange-500">
                                      {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-6 border border-orange-100">
                              <p className="text-orange-800 leading-relaxed text-base font-medium">
                                "{review.comment}"
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleEdit(review)}
                                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-lg"
                                  disabled={reviewLoading}
                                >
                                  Edit Review
                                </button>
                                <button
                                  onClick={() => handleDelete(review._id)}
                                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg"
                                  disabled={reviewLoading}
                                >
                                  Delete Review
                                </button>
                              </div>
                              <div className="text-xs text-orange-500">
                                Verified Booking
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-dashed border-orange-300">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <MessageCircle className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-orange-700 mb-3">No Reviews Yet</h3>
                        <p className="text-orange-600 max-w-md mx-auto leading-relaxed">
                          Be the first to share your experience and help other travelers make informed decisions about this vehicle.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;