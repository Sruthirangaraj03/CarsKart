import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Fuel, Settings, Star, Heart, Eye, Car, Clock, Shield, ArrowLeft } from 'lucide-react';
import api from '../services/api'; // Import your axios instance

const RentalDealsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    const controller = new AbortController();
    
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/api/products', {
          signal: controller.signal
        });
        console.log('📦 Full API Response:', response.data);
        
        const data = response.data;
        
        // Handle different response structures
        let productsArray = [];
        
        if (data.success && data.products) {
          productsArray = data.products;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        }
        
        console.log('✅ Products loaded:', productsArray.length, productsArray);
        console.log('🔍 First product:', productsArray[0]);
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('❌ Error fetching products:', error);
          setError(error.response?.data?.message || error.message || 'Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
    
    return () => controller.abort();
  }, []);

  // Local search function
  const performLocalSearch = useCallback(() => {
    const filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.title?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.model?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.location?.city?.toLowerCase().includes(searchLower) ||
        product.location?.state?.toLowerCase().includes(searchLower) ||
        product.location?.address?.toLowerCase().includes(searchLower) ||
        product.specifications?.fuelType?.toLowerCase().includes(searchLower) ||
        product.specifications?.transmission?.toLowerCase().includes(searchLower)
      );
    });
    console.log('🔍 Search results:', filtered.length);
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  // Local search when searchTerm changes
  useEffect(() => {
    console.log('🔍 Search effect - products:', products.length, 'searchTerm:', searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      performLocalSearch();
    }
  }, [searchTerm, products, performLocalSearch]);

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Location not specified';
    }
    
    const { city, state, pincode } = location;
    const parts = [];
    
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    
    return parts.join(', ') || 'Location not specified';
  };

  const getImageUrl = (product) => {
    const baseUrl = api.defaults.baseURL;
    if (product?.images?.primary) {
      return `${baseUrl}${product.images.primary}`;
    }
    if (product?.images?.gallery?.[0]) {
      return `${baseUrl}${product.images.gallery[0]}`;
    }
    return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';
  };

  const handleProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBookNow = (car) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book a car");
      navigate('/login');
      return;
    }
    
    navigate('/book', { 
      state: { 
        productId: car._id, 
        product: car,
        quantity: 1 
      }
    });
  };

  const handleAddToFavorites = async (car) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add to favorites");
        navigate('/login');
        return;
      }

      const response = await api.post('/api/favorites/add', { 
        productId: car._id 
      });

      if (response.data.success) {
        alert("Added to favorites!");
        navigate('/fav');
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      
      if (error.response?.status === 400) {
        alert("Product already in favorites!");
      } else {
        alert(`Failed to add to favorites: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const CarCard = ({ car }) => {
    const rating = car.metrics?.rating?.average || 0;
    const displayRating = rating > 0 ? rating.toFixed(1) : '4.5';

    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-orange-200">
        <div className="flex flex-col lg:flex-row h-full">
          <div 
            className="lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
            onClick={() => handleProductDetails(car._id)}
          >
            <img 
              src={getImageUrl(car)}
              alt={car.title || 'Car'}
              className="w-full h-56 lg:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';
              }}
            />
            
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-lg text-white ${
                car.availability?.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {car.availability?.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <button 
                className="bg-white/90 hover:bg-white p-2 rounded-full transition-all shadow-lg hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToFavorites(car);
                }}
              >
                <Heart className="w-4 h-4 text-gray-400 hover:text-orange-400 transition-colors" />
              </button>
            </div>
            
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs border">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                <span className="font-semibold">{displayRating}</span>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight cursor-pointer"
                    onClick={() => handleProductDetails(car._id)}
                  >
                    {car.title || `${car.brand || ''} ${car.model || 'Car'}`.trim() || 'Car Name'}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 mr-1 text-orange-400" />
                    <span className="text-xs font-medium">{formatLocation(car.location)}</span>
                  </div>
                  {car.adminId?.name && (
                    <div className="flex items-center text-gray-400 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      <span>Hosted by {car.adminId.name}</span>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-orange-500">
                    ₹{car.pricing?.daily || '999'}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">per day</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="flex flex-col items-center gap-1 bg-orange-50 rounded-xl p-2 border border-orange-100">
                  <Fuel className="w-4 h-4 text-orange-500" />
                  <div className="text-xs font-bold text-gray-800">
                    {car.specifications?.mileage || '15'} km/l
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-xl p-2 border border-blue-100">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div className="text-xs font-bold text-gray-800">
                    {car.specifications?.seatingCapacity || '5'} Seats
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                  <Settings className="w-4 h-4 text-emerald-500" />
                  <div className="text-xs font-bold text-gray-800">
                    {car.specifications?.transmission || 'Manual'}
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 bg-purple-50 rounded-xl p-2 border border-purple-100">
                  <Fuel className="w-4 h-4 text-purple-500" />
                  <div className="text-xs font-bold text-gray-800">
                    {car.specifications?.fuelType || 'Petrol'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {car.features && car.features.length > 0 ? (
                  car.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                      {feature}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                      Insured
                    </span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                      Clean
                    </span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                      Support
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  car.availability?.isAvailable 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!car.availability?.isAvailable}
                onClick={() => handleBookNow(car)}
              >
                {car.availability?.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
              <button 
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 border border-gray-200"
                onClick={() => handleProductDetails(car._id)}
              >
                <Eye className="w-4 h-4" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingCard = () => (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/5 bg-gray-200 h-64 lg:h-80"></div>
        <div className="lg:w-3/5 p-8">
          <div className="h-6 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded-lg mb-6 w-1/2"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex-1 h-14 bg-gray-200 rounded-2xl"></div>
            <div className="w-28 h-14 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-25">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect <span className="text-orange-100">Ride</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-orange-100">
              Choose from verified cars across India
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search by car name, location, or type..."
                  className="w-full pl-14 pr-5 py-4 text-gray-900 text-lg rounded-3xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 border-0 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* API Status Alert */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-orange-800">API Connection Issue</div>
                <div className="text-sm text-orange-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            {searchTerm ? `Search Results (${filteredProducts.length})` : `Rental Deals (${products.length})`}
          </h2>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-orange-500 hover:text-orange-600 font-medium bg-orange-50 px-4 py-2 rounded-xl border border-orange-200"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Cars Grid */}
        <div className="space-y-6">
          {loading ? (
            // Loading State
            Array.from({length: 3}).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : filteredProducts.length === 0 ? (
            // No Results State
            <div className="text-center py-16">
              <Car className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <div className="text-2xl font-semibold text-gray-600 mb-3">
                {searchTerm ? 'No cars found for your search' : 'No cars available'}
              </div>
              <div className="text-gray-400">
                {searchTerm ? 'Try searching with different keywords' : 'Please check back later'}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Debug: Total products: {products.length}, Filtered: {filteredProducts.length}, Loading: {loading.toString()}
              </div>
            </div>
          ) : (
            // Cars List
            <>
              {console.log('🚗 Rendering cars:', filteredProducts.length)}
              {filteredProducts.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDealsPage;