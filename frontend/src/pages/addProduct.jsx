import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Car,
  Upload,
  X,
  Check,
  AlertCircle,
  TrendingUp,  
  MapPin,
  Settings,
  Shield,
  Star,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

// Image URL helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const API_BASE = 'https://cars-kart.onrender.com/api';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${API_BASE}${cleanPath}`;
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Track existing images for updates
  const [hostId, setHostId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const API_BASE = 'https://cars-kart.onrender.com/api';
  const productId = searchParams.get('edit');
  const isEditMode = !!productId; // Boolean flag for edit mode

  // Simplified initial form
  const initialForm = {
    title: '',
    description: '',
    category: 'Sedan',
    brand: '',
    model: '',
    year: '',
    pricing: {
      hourly: '',
      daily: '',
      securityDeposit: '1000'
    },
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    specifications: {
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: '5',
      mileage: '',
      engineCapacity: '',
      color: '',
      registrationNumber: ''
    },
    features: [],
    insurance: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
      coverageType: 'Third Party'
    },
    availability: {
      isAvailable: true,
      minBookingDuration: '1',
      maxBookingDuration: '720'
    },
    rules: {
      drivingLicenseRequired: true,
      additionalRequirements: []
    }
  };

  const [formData, setFormData] = useState({ ...initialForm });
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');

  const categories = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Convertible', 'Truck', 'Van', 'Bike', 'Scooter'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
  const transmissions = ['Manual', 'Automatic', 'CVT', 'AMT'];
  const coverageTypes = ['Comprehensive', 'Third Party'];

  const getToken = () => localStorage.getItem('token');
  const getHostId = () => {
    const urlHostId = searchParams.get('hostId');
    if (urlHostId) return urlHostId;
    return localStorage.getItem('currentHostId') || localStorage.getItem('hostId');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const ensureHost = async () => {
    const token = getToken();
    const currentHostId = getHostId();
    
    if (!token) {
      showNotification('Please login to continue', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return null;
    }

    if (currentHostId) {
      setHostId(currentHostId);
      localStorage.setItem('currentHostId', currentHostId);
      localStorage.setItem('hostId', currentHostId);
      return currentHostId;
    }

    try {
      const res = await fetch(`${API_BASE}/host/check-status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      
      if (res.ok && data.success && data.isHost) {
        const apiHostId = data.hostData?._id || data.hostData?.id || data.hostId;
        if (apiHostId) {
          setHostId(apiHostId);
          localStorage.setItem('currentHostId', apiHostId);
          localStorage.setItem('hostId', apiHostId);
          return apiHostId;
        }
      }
      
      showNotification('You need to become a host first. Redirecting to pricing...', 'error');
      setTimeout(() => navigate('/pricing'), 2000);
      return null;
      
    } catch (err) {
      console.error('Host check error:', err);
      showNotification('Unable to verify host status. Please try refreshing.', 'warning');
      return null;
    }
  };

  const fetchProductForEdit = async (hostIdParam, productId) => {
    const resolvedHostId = hostIdParam || getHostId();
    
    if (!resolvedHostId || !productId) return;

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/host/${resolvedHostId}/products/${productId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const product = data.product || data;
        setEditingProduct(product);
        
        // Populate form with existing data
        setFormData({
          title: product.title || '',
          description: product.description || '',
          category: product.category || 'Sedan',
          brand: product.brand || '',
          model: product.model || '',
          year: product.year?.toString() || '',
          pricing: {
            hourly: product.pricing?.hourly?.toString() || '',
            daily: product.pricing?.daily?.toString() || '',
            securityDeposit: product.pricing?.securityDeposit?.toString() || '1000'
          },
          location: {
            address: product.location?.address || '',
            city: product.location?.city || '',
            state: product.location?.state || '',
            pincode: product.location?.pincode || '',
            landmark: product.location?.landmark || ''
          },
          specifications: {
            fuelType: product.specifications?.fuelType || 'Petrol',
            transmission: product.specifications?.transmission || 'Manual',
            seatingCapacity: product.specifications?.seatingCapacity?.toString() || '5',
            mileage: product.specifications?.mileage?.toString() || '',
            engineCapacity: product.specifications?.engineCapacity?.toString() || '',
            color: product.specifications?.color || '',
            registrationNumber: product.specifications?.registrationNumber || ''
          },
          features: product.features || [],
          insurance: {
            provider: product.insurance?.provider || '',
            policyNumber: product.insurance?.policyNumber || '',
            expiryDate: product.insurance?.expiryDate ? product.insurance.expiryDate.split('T')[0] : '',
            coverageType: product.insurance?.coverageType || 'Third Party'
          },
          availability: {
            isAvailable: product.availability?.isAvailable !== false,
            minBookingDuration: product.availability?.minBookingDuration?.toString() || '1',
            maxBookingDuration: product.availability?.maxBookingDuration?.toString() || '720'
          },
          rules: {
            drivingLicenseRequired: product.rules?.drivingLicenseRequired !== false,
            additionalRequirements: product.rules?.additionalRequirements || []
          }
        });

        // Handle existing images
        const existingImageUrls = [];
        if (product.images?.gallery && product.images.gallery.length > 0) {
          const galleryUrls = product.images.gallery.map(img => getImageUrl(img));
          existingImageUrls.push(...galleryUrls);
          setExistingImages(product.images.gallery); // Store original paths
        } else if (product.images?.primary) {
          const primaryUrl = getImageUrl(product.images.primary);
          existingImageUrls.push(primaryUrl);
          setExistingImages([product.images.primary]); // Store original path
        }
        
        setImagePreviews(existingImageUrls);
        setSelectedImages([]); // No new images initially
        
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to fetch product details', 'error');
        setTimeout(() => navigate('/host-dashboard'), 2000);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showNotification('Error connecting to server. Please check your connection.', 'error');
      setTimeout(() => navigate('/host-dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      
      const verifiedHostId = await ensureHost();
      if (verifiedHostId) {
        if (productId) {
          await fetchProductForEdit(verifiedHostId, productId);
        }
      }
      
      setLoading(false);
    };

    initializePage();
  }, [productId]);

  const validateFiles = (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    // Check file count including existing images
    const totalImages = existingImages.length + selectedImages.length + files.length;
    if (totalImages > maxFiles) {
      throw new Error(`Too many files selected. Maximum is ${maxFiles} files total.`);
    }

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.`);
      }
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(`File too large: ${file.name} (${sizeMB}MB). Maximum size is 5MB.`);
      }
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    try {
      validateFiles(files);
      
      // Add new files to selected images
      setSelectedImages((prev) => [...prev, ...files]);

      // Create previews for new files
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreviews((prev) => [...prev, ev.target.result]);
        };
        reader.readAsDataURL(file);
      });
      
      showNotification(`${files.length} image(s) added successfully`, 'success');
      
    } catch (error) {
      showNotification(error.message, 'error');
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const totalExistingImages = existingImages.length;
    
    if (index < totalExistingImages) {
      // Removing an existing image
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing a new image
      const newImageIndex = index - totalExistingImages;
      setSelectedImages((prev) => prev.filter((_, i) => i !== newImageIndex));
    }
    
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !formData.rules.additionalRequirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          additionalRequirements: [...prev.rules.additionalRequirements, currentRequirement.trim()]
        }
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        additionalRequirements: prev.rules.additionalRequirements.filter((_, i) => i !== index)
      }
    }));
  };

  const handleNestedChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resolvedHostId = getHostId();
    if (!resolvedHostId) {
      showNotification('Host ID not found. Please refresh the page.', 'error');
      return;
    }

    // Basic validation
    const requiredFields = [
      { field: formData.title, name: 'Title' },
      { field: formData.description, name: 'Description' },
      { field: formData.brand, name: 'Brand' },
      { field: formData.model, name: 'Model' },
      { field: formData.year, name: 'Year' },
      { field: formData.pricing.daily, name: 'Daily Price' },
      { field: formData.location.address, name: 'Address' },
      { field: formData.location.city, name: 'City' },
      { field: formData.location.state, name: 'State' },
      { field: formData.location.pincode, name: 'Pincode' },
      { field: formData.specifications.mileage, name: 'Mileage' },
      { field: formData.specifications.color, name: 'Color' },
      { field: formData.specifications.registrationNumber, name: 'Registration Number' },
      { field: formData.insurance.provider, name: 'Insurance Provider' },
      { field: formData.insurance.policyNumber, name: 'Policy Number' },
      { field: formData.insurance.expiryDate, name: 'Insurance Expiry Date' }
    ];

    const missingFields = requiredFields.filter(req => !req.field || req.field.toString().trim() === '');
    
    if (missingFields.length > 0) {
      showNotification(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    
    try {
      const token = getToken();
      
      // Different URLs for create vs update
      const url = isEditMode 
        ? `${API_BASE}/host/${resolvedHostId}/products/${productId}`
        : `${API_BASE}/host/${resolvedHostId}/products`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Prepare the payload
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        pricing: {
          hourly: parseFloat(formData.pricing.hourly) || 0,
          daily: parseFloat(formData.pricing.daily),
          securityDeposit: parseFloat(formData.pricing.securityDeposit) || 1000
        },
        location: {
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
          pincode: formData.location.pincode,
          landmark: formData.location.landmark || ''
        },
        specifications: {
          fuelType: formData.specifications.fuelType,
          transmission: formData.specifications.transmission,
          seatingCapacity: parseInt(formData.specifications.seatingCapacity) || 5,
          mileage: parseFloat(formData.specifications.mileage),
          engineCapacity: parseFloat(formData.specifications.engineCapacity) || 0,
          color: formData.specifications.color,
          registrationNumber: formData.specifications.registrationNumber.toUpperCase()
        },
        features: formData.features.filter(f => f.trim()),
        insurance: {
          provider: formData.insurance.provider,
          policyNumber: formData.insurance.policyNumber,
          expiryDate: formData.insurance.expiryDate,
          coverageType: formData.insurance.coverageType
        },
        availability: {
          isAvailable: formData.availability.isAvailable,
          minBookingDuration: parseInt(formData.availability.minBookingDuration) || 1,
          maxBookingDuration: parseInt(formData.availability.maxBookingDuration) || 720
        },
        rules: {
          drivingLicenseRequired: formData.rules.drivingLicenseRequired,
          additionalRequirements: formData.rules.additionalRequirements.filter(r => r.trim())
        }
      };

      // For updates, include existing images info
      if (isEditMode) {
        payload.existingImages = existingImages;
      }

      let response;
      
      if (selectedImages.length > 0) {
        // Use FormData for requests with new images
        const formDataPayload = new FormData();
        formDataPayload.append('data', JSON.stringify(payload));
        
        selectedImages.forEach((img) => {
          formDataPayload.append('images', img);
        });

        response = await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData, browser will set it with boundary
          },
          body: formDataPayload,
        });
      } else {
        // Use JSON for requests without new images
        response = await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        const action = isEditMode ? 'updated' : 'created';
        showNotification(`Product ${action} successfully!`, 'success');
        setTimeout(() => navigate('/host-dashboard'), 1500);
      } else {
        console.error('Submit error:', result);
        showNotification(result.message || `Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
      }
    } catch (err) {
      console.error('Network error:', err);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/host-dashboard');
  };

  if (loading && !hostId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">
            {productId ? 'Loading product details...' : 'Verifying host access...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center gap-6">
              <button
                onClick={handleCancel}
                className="text-orange-100 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-full"
                disabled={loading}
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h1>
                <p className="text-orange-100 text-lg">
                  {isEditMode ? 'Update your vehicle details' : 'Add a vehicle to your inventory'}
                </p>
              </div>
            </div>
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

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Car className="w-6 h-6" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="e.g., Premium BMW X5 for Rent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({...prev, brand: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., BMW, Mercedes, Toyota"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., X5, C-Class, Camry"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Year *</label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max={new Date().getFullYear() + 2}
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({...prev, year: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Detailed description of the vehicle, its features, and condition..."
                  minLength="10"
                  maxLength="1000"
                  disabled={loading}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.description.length}/1000 characters
                </div>
              </div>
            </div>

            {/* Pricing - Simplified */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Pricing Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.hourly}
                    onChange={(e) => handleNestedChange('pricing.hourly', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Optional"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Daily Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.pricing.daily}
                    onChange={(e) => handleNestedChange('pricing.daily', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 2500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.pricing.securityDeposit}
                    onChange={(e) => handleNestedChange('pricing.securityDeposit', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 10000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.location.address}
                    onChange={(e) => handleNestedChange('location.address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Full address where vehicle is located"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.location.city}
                    onChange={(e) => handleNestedChange('location.city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Chennai"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.location.state}
                    onChange={(e) => handleNestedChange('location.state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Tamil Nadu"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    pattern="^\d{6}$"
                    value={formData.location.pincode}
                    onChange={(e) => handleNestedChange('location.pincode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="6-digit pincode"
                    maxLength="6"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Landmark</label>
                  <input
                    type="text"
                    value={formData.location.landmark}
                    onChange={(e) => handleNestedChange('location.landmark', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nearby landmark (optional)"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Type *</label>
                  <select
                    required
                    value={formData.specifications.fuelType}
                    onChange={(e) => handleNestedChange('specifications.fuelType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  >
                    {fuelTypes.map(fuel => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Transmission *</label>
                  <select
                    required
                    value={formData.specifications.transmission}
                    onChange={(e) => handleNestedChange('specifications.transmission', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  >
                    {transmissions.map(trans => (
                      <option key={trans} value={trans}>{trans}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seating Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="15"
                    value={formData.specifications.seatingCapacity}
                    onChange={(e) => handleNestedChange('specifications.seatingCapacity', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mileage (km/l) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.specifications.mileage}
                    onChange={(e) => handleNestedChange('specifications.mileage', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 15"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Engine Capacity (CC)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.specifications.engineCapacity}
                    onChange={(e) => handleNestedChange('specifications.engineCapacity', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 2000 (optional)"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.specifications.color}
                    onChange={(e) => handleNestedChange('specifications.color', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Black, White, Silver"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.specifications.registrationNumber}
                    onChange={(e) => handleNestedChange('specifications.registrationNumber', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., TN01AB1234"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6" />
                Vehicle Features
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Add a feature (e.g., Air Conditioning, GPS, Bluetooth)"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200"
                    disabled={loading || !currentFeature.trim()}
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-orange-600 hover:text-orange-800"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Insurance Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Insurance Provider *</label>
                  <input
                    type="text"
                    required
                    value={formData.insurance.provider}
                    onChange={(e) => handleNestedChange('insurance.provider', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., ICICI Lombard, HDFC ERGO"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Policy Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.insurance.policyNumber}
                    onChange={(e) => handleNestedChange('insurance.policyNumber', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Insurance policy number"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.insurance.expiryDate}
                    onChange={(e) => handleNestedChange('insurance.expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Coverage Type *</label>
                  <select
                    required
                    value={formData.insurance.coverageType}
                    onChange={(e) => handleNestedChange('insurance.coverageType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  >
                    {coverageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Availability & Rules */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Availability & Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.availability.isAvailable}
                    onChange={(e) => handleNestedChange('availability.isAvailable', e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={loading}
                  />
                  <label htmlFor="isAvailable" className="text-sm font-bold text-gray-700">
                    Currently Available
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min Booking (hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.availability.minBookingDuration}
                    onChange={(e) => handleNestedChange('availability.minBookingDuration', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Booking (hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.availability.maxBookingDuration}
                    onChange={(e) => handleNestedChange('availability.maxBookingDuration', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="drivingLicenseRequired"
                    checked={formData.rules.drivingLicenseRequired}
                    onChange={(e) => handleNestedChange('rules.drivingLicenseRequired', e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    disabled={loading}
                  />
                  <label htmlFor="drivingLicenseRequired" className="text-sm font-bold text-gray-700">
                    Driving License Required
                  </label>
                </div>
              </div>
              
              {/* Additional Requirements */}
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Requirements</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Add requirement (e.g., Clean driving record)"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200"
                    disabled={loading || !currentRequirement.trim()}
                  >
                    Add
                  </button>
                </div>
                {formData.rules.additionalRequirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.rules.additionalRequirements.map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                      >
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Vehicle Images
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={loading}
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700 font-semibold text-lg">Click to upload vehicle images</p>
                  <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 5MB each (Max 5 images total)</p>
                  <p className="text-orange-600 text-sm mt-1">First image will be used as primary image</p>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl shadow-lg"
                        onError={(e) => {
                          console.error('❌ Preview image error:', preview);
                          e.target.style.display = 'none';
                          e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                        }}
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl"
                        style={{ display: 'none' }}
                      >
                        <Car className="w-8 h-8 text-gray-400" />
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      {index < existingImages.length && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;