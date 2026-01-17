import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Fuel, Settings, Star, Heart, Eye, Car, Clock, Shield, ArrowLeft } from 'lucide-react';

const RentalDealsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      handleSearch();
    }
  }, [searchTerm, products]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch('https://carskart-backend.onrender.com/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`https://carskart-backend.onrender.com/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFilteredProducts(data.products);
        } else {
          // Fallback to local filtering
          performLocalSearch();
        }
      } else {
        // Fallback to local filtering
        performLocalSearch();
      }
      
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local filtering
      performLocalSearch();
    } finally {
      setLoading(false);
    }
  };

  const performLocalSearch = () => {
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
    setFilteredProducts(filtered);
  };

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Location not specified';
    }
    
    const { address, city, state, pincode, landmark } = location;
    const parts = [];
    
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    
    return parts.join(', ') || 'Location not specified';
  };

  const getImageUrl = (product) => {
    if (product?.images?.primary) {
      return `https://carskart-backend.onrender.com${product.images.primary}`;
    }
    if (product?.images?.gallery?.[0]) {
      return `https://carskart-backend.onrender.com${product.images.gallery[0]}`;
    }
    return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';
  };

  // Navigate to product details page
  const handleProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle Book Now for car cards
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

  // Handle Add to Favorites for car cards
  const handleAddToFavorites = async (car) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add to favorites");
        navigate('/login');
        return;
      }

      const response = await fetch("https://carskart-backend.onrender.com/api/favorites/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: car._id })
      });

      if (response.ok) {
        alert("Added to favorites!");
        navigate('/fav');
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

  const CarCard = ({ car }) => (
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
              <span className="font-semibold">{car.rating || '4.5'}</span>
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
                  ₹{car.pricing?.daily || car.pricePerDay || '999'}
                </div>
                <div className="text-xs text-gray-400 font-medium">per day</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col items-center gap-1 bg-orange-50 rounded-xl p-2 border border-orange-100">
                <Fuel className="w-4 h-4 text-orange-500" />
                <div className="text-xs font-bold text-gray-800">
                  {car.specifications?.mileage || car.mileage || '15'} km/l
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-xl p-2 border border-blue-100">
                <Users className="w-4 h-4 text-blue-500" />
                <div className="text-xs font-bold text-gray-800">
                  {car.specifications?.seatingCapacity || car.seatingCapacity || '5'} Seats
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                <Settings className="w-4 h-4 text-emerald-500" />
                <div className="text-xs font-bold text-gray-800">
                  {car.specifications?.transmission || car.transmission || 'Manual'}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 bg-purple-50 rounded-xl p-2 border border-purple-100">
                <Fuel className="w-4 h-4 text-purple-500" />
                <div className="text-xs font-bold text-gray-800">
                  {car.specifications?.fuelType || car.fuelType || 'Petrol'}
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
            </div>
          ) : (
            // Cars List
            filteredProducts.map((car) => (
              <CarCard key={car._id} car={car} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDealsPage;