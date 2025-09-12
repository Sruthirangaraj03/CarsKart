import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Car,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Fuel,
  TrendingUp,
  Package,
  Star,
  FileText,
} from 'lucide-react';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [notification, setNotification] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [hostData, setHostData] = useState(null);

  const API_BASE = 'https://cars-kart.onrender.com/api';

  const categories = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Convertible', 'Truck', 'Van', 'Bike', 'Scooter'];
  const statuses = ['active', 'inactive', 'deleted', 'maintenance', 'pending_approval'];

  // Image URL helper function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const BACKEND_URL = 'https://cars-kart.onrender.com';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${BACKEND_URL}${cleanPath}`;
  };

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  const getHostId = () => {
    const urlHostId = searchParams.get('hostId');
    if (urlHostId) return urlHostId;
    
    const storedHostId = localStorage.getItem('currentHostId') || localStorage.getItem('hostId');
    return storedHostId;
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const ensureHost = async () => {
    const token = getToken();
    const currentHostId = getHostId();
    
    console.log('🔍 ensureHost called - token:', !!token, 'hostId:', currentHostId);
    
    if (!token) {
      console.log('❌ No token found');
      showNotification('Please login to continue', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return null;
    }

    if (currentHostId) {
      console.log('✅ Found hostId:', currentHostId);
      setHostId(currentHostId);
      localStorage.setItem('currentHostId', currentHostId);
      localStorage.setItem('hostId', currentHostId);
      return currentHostId;
    }

    try {
      console.log('🌐 Checking host status via API...');
      const res = await fetch(`${API_BASE}/host/check-status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      console.log('📋 Host status response:', data);
      
      if (res.ok && data.success && data.isHost) {
        const apiHostId = data.hostData?._id || data.hostData?.id || data.hostId;
        if (apiHostId) {
          console.log('✅ Host verified via API, hostId:', apiHostId);
          setHostId(apiHostId);
          setHostData(data.hostData || null);
          localStorage.setItem('currentHostId', apiHostId);
          localStorage.setItem('hostId', apiHostId);
          return apiHostId;
        }
      }
      
      console.log('❌ User is not a host');
      showNotification('You need to become a host first. Redirecting to pricing...', 'error');
      setTimeout(() => {
        navigate('/pricing');
      }, 2000);
      return null;
      
    } catch (err) {
      console.error('❌ Host check error:', err);
      showNotification('Unable to verify host status. If you are a host, try refreshing.', 'warning');
      return null;
    }
  };

  const fetchProducts = async (hostIdParam) => {
    const resolvedHostId = hostIdParam || getHostId();
    console.log('📦 fetchProducts called with hostId:', resolvedHostId);
    
    if (!resolvedHostId) {
      console.log('❌ No hostId for fetching products');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/host/${resolvedHostId}/products`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const productsArray = data.products || [];
        setProducts(Array.isArray(productsArray) ? productsArray : []);
        console.log('✅ Products loaded:', productsArray.length);
        if (productsArray.length === 0) {
          showNotification('No products found. Start by adding your first vehicle!', 'info');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch products:', errorData);
        showNotification(errorData.message || 'Failed to fetch products', 'error');
        setProducts([]);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      showNotification('Error connecting to server. Please check your connection.', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      console.log('🚀 Initializing ProductManagementPage...');
      setLoading(true);
      
      const verifiedHostId = await ensureHost();
      if (verifiedHostId) {
        console.log('✅ Host verified, loading products...');
        await fetchProducts(verifiedHostId);
      } else {
        console.log('❌ Host verification failed');
      }
      
      setLoading(false);
    };

    initializePage();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(lower) ||
          p.brand?.toLowerCase().includes(lower) ||
          p.model?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.specifications?.registrationNumber?.toLowerCase().includes(lower)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterStatus, filterCategory]);

  const handleEdit = (product) => {
    // Navigate to add product page with edit parameters
    navigate(`/add-product?edit=${product._id}&hostId=${hostId}`);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const resolvedHostId = getHostId();
    if (!resolvedHostId) {
      showNotification('Host ID not found. Please refresh the page.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/host/${resolvedHostId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, status: 'deleted' } : p))
        );
        showNotification('Product deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (productId) => {
    const resolvedHostId = getHostId();
    if (!resolvedHostId) {
      showNotification('Host ID not found. Please refresh the page.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/host/${resolvedHostId}/products/${productId}/restore`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, status: 'active' } : p))
        );
        showNotification('Product restored successfully!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to restore product', 'error');
      }
    } catch (err) {
      console.error('Restore error:', err);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewVehicle = () => {
    navigate(`/add-product?hostId=${hostId}`);
  };

  // Stats derivation
  const activeProducts = products.filter((p) => p.status === 'active');
  const totalViews = products.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
  const totalBookings = products.reduce((sum, p) => sum + (p.metrics?.totalBookings || 0), 0);
  const avgRating =
    products.length > 0
      ? (products.reduce((sum, p) => sum + (p.metrics?.rating?.average || 0), 0) / products.length).toFixed(1)
      : '0.0';

  const stats = [
    {
      icon: Package,
      label: 'Total Vehicles',
      value: products.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Active Listings',
      value: activeProducts.length,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: totalViews,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Star,
      label: 'Avg Rating',
      value: avgRating,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  // Show loading screen during initial host verification
  if (loading && !hostId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">Verifying host access...</p>
          <p className="text-gray-500 text-sm">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Product Management</h1>
              <p className="text-orange-100 text-lg">Manage your premium vehicle inventory</p>
            </div>
            <button
              onClick={handleAddNewVehicle}
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-orange-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 flex items-center gap-3 p-4 rounded-xl shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : notification.type === 'info'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : notification.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <Check className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="flex-1 font-semibold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white/50">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by title, brand, model, or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white text-lg font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="pending_approval">Pending</option>
                </select>
              </div>
            </div>
            <div className="lg:w-48">
              <div className="relative">
                <Car className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white text-lg font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16">
                <Car className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {products.length === 0 ? 'No vehicles in inventory' : 'No vehicles match your search'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {products.length === 0
                    ? 'Start by adding your first vehicle to the inventory'
                    : 'Try adjusting your search terms or filters'}
                </p>
                {products.length === 0 && (
                  <button
                    onClick={handleAddNewVehicle}
                    className="mt-6 inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Vehicle
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                  product.status === 'deleted' || product.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  {product.images?.primary || (product.images?.gallery && product.images.gallery[0]) ? (
                    <img
                      src={getImageUrl(product.images.primary || product.images.gallery[0])}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('✅ Image loaded:', product.title)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback placeholder - this will show when image fails or doesn't exist */}
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ display: (product.images?.primary || product.images?.gallery?.[0]) ? 'none' : 'flex' }}
                  >
                    <Car className="w-16 h-16 text-gray-400" />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                      product.status === 'active' ? 'bg-green-500 text-white' :
                      product.status === 'inactive' ? 'bg-yellow-500 text-white' :
                      product.status === 'deleted' ? 'bg-red-500 text-white' :
                      product.status === 'maintenance' ? 'bg-orange-500 text-white' :
                      product.status === 'pending_approval' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1).replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      {product.category}
                    </span>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {product.metrics?.views || 0}
                    </div>
                    {product.metrics?.rating?.average > 0 && (
                      <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {product.metrics.rating.average.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{product.title}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Vehicle:</span>
                      <span className="font-bold text-gray-900">{product.year} {product.brand} {product.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Daily Rate:</span>
                      <span className="font-bold text-2xl text-orange-600">
                        ₹{Number(product.pricing?.daily || 0)?.toLocaleString()}
                      </span>
                    </div>
                    {product.pricing?.securityDeposit > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Security Deposit:</span>
                        <span className="font-bold text-gray-900">
                          ₹{Number(product.pricing.securityDeposit)?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Seating:</span>
                      <span className="font-bold text-gray-900">{product.specifications?.seatingCapacity || 'N/A'} seats</span>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Fuel className="w-4 h-4" />
                        <span>
                          {product.specifications?.fuelType} • {product.specifications?.transmission}
                        </span>
                      </div>
                      {product.location?.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{product.location.city}, {product.location.state}</span>
                        </div>
                      )}
                      {product.specifications?.registrationNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{product.specifications.registrationNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                      {product.availability?.isAvailable === false && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Currently Unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {product.status !== 'deleted' ? (
                      <>
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(product._id)}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;