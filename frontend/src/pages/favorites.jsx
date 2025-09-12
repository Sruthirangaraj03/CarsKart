import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, Fuel, Settings, Trash2, Eye, ArrowLeft } from 'lucide-react';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://cars-kart.onrender.com/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        throw new Error(data.message || 'Failed to load favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (productId) => {
    if (!window.confirm("Remove this car from your favorites?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch('https://cars-kart.onrender.com/api/favorites/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setFavorites(favorites.filter(fav => fav.product._id !== productId));
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
  };

  const handleBookNow = (car) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to book a car');
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

  const handleViewDetails = (productId) => {
    navigate('/rental-deals', { state: { selectedProductId: productId } });
  };

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Location not specified';
    }
    
    const { address, city, state, pincode } = location;
    const parts = [];
    
    if (city) parts.push(city);
    if (state) parts.push(state);
    
    return parts.join(', ') || 'Location not specified';
  };

  const getImageUrl = (product) => {
    if (product?.images?.primary) {
      return `https://cars-kart.onrender.com${product.images.primary}`;
    }
    if (product?.images?.gallery?.[0]) {
      return `https://cars-kart.onrender.com${product.images.gallery[0]}`;
    }
    return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';
  };

  const FavoriteCard = ({ favorite }) => {
    const car = favorite.product;
    
    return (
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-orange-100">
        <div className="relative">
          <img 
            src={getImageUrl(car)}
            alt={car.title || 'Car'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onClick={() => handleViewDetails(car._id)}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';
            }}
          />
          
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              car.availability?.isAvailable 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {car.availability?.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          <button 
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-all shadow-sm hover:shadow-md group-hover:scale-110"
            onClick={() => handleRemoveFromFavorites(car._id)}
            title="Remove from favorites"
          >
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 
                className="text-xl font-semibold text-gray-900 mb-1 hover:text-orange-500 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(car._id)}
              >
                {car.title || `${car.brand || ''} ${car.model || 'Car'}`.trim() || 'Car Name'}
              </h3>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{formatLocation(car.location)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">
                ₹{car.pricing?.daily || car.pricePerDay || '999'}
              </div>
              <div className="text-sm text-gray-500">per day</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{car.specifications?.seatingCapacity || car.seatingCapacity || '5'}</span>
            </div>
            <div className="flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              <span>{car.specifications?.transmission || car.transmission || 'Manual'}</span>
            </div>
            <div className="flex items-center">
              <Fuel className="w-4 h-4 mr-1" />
              <span>{car.specifications?.fuelType || car.fuelType || 'Petrol'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                car.availability?.isAvailable 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!car.availability?.isAvailable}
              onClick={() => handleBookNow(car)}
            >
              {car.availability?.isAvailable ? 'Book Now' : 'Not Available'}
            </button>
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
              onClick={() => handleViewDetails(car._id)}
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoadingCard = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-orange-100">
      <div className="bg-gray-200 h-48"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded mb-4 w-1/2"></div>
        <div className="flex justify-between mb-6">
          <div className="h-4 bg-gray-100 rounded w-16"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-20 h-10 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="bg-orange-100 hover:bg-orange-200 p-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Saved Cars
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${favorites.length} cars saved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="text-red-800 font-medium mb-2">Unable to load favorites</div>
            <div className="text-red-600 text-sm mb-3">{error}</div>
            <button 
              onClick={fetchFavorites}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No saved cars yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring our cars and save your favorites for easy access later.
            </p>
            <button 
              onClick={() => navigate('/rental-deals')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Explore Cars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <FavoriteCard key={favorite._id} favorite={favorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;