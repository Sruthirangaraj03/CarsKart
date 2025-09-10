// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaCrown } from "react-icons/fa";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check for logged in user on component mount and localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // Always use the full name from signup, never email
    return user.name || 'User';
  };

  // Helper function to get avatar initial - ALWAYS from the full name field
  const getAvatarInitial = () => {
    if (!user || !user.name || !user.name.trim()) {
      return 'U'; // Fallback if no name exists
    }
    
    // ALWAYS take first letter of the full name field
    return user.name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setShowDropdown(false);
      navigate('/');
      alert('👋 You have been logged out successfully!');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNavigation = (path) => {
    if (!user) {
      // If not logged in, redirect to pricing
      navigate("/pricing");
      return;
    }

    // If user has subscription, check role
    if (user.subscription) {
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        // Show their current plan instead of all pricing
        navigate("/dashboard");
      }
    } else {
      // No subscription, show pricing
      navigate("/pricing");
    }
  };

  // Function to check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Function to get nav link classes
  const getNavLinkClasses = (path) => {
    const baseClasses = "group cursor-pointer relative py-2";
    const isActive = isActivePath(path);
    
    return `${baseClasses} ${isActive ? 'text-orange-600' : ''}`;
  };

  // Function to get underline classes
  const getUnderlineClasses = (path) => {
    const baseClasses = "absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300";
    const isActive = isActivePath(path);
    
    return `${baseClasses} ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo - Far Left */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                className="w-7 h-7"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">CarsKart</span>
              <span className="text-xs text-gray-500 -mt-1 font-medium">Rent. Drive. Earn.</span>
            </div>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden lg:flex items-center space-x-10 flex-1 justify-center">
            <div 
              onClick={() => handleNavigation("/pricing")}
              className={getNavLinkClasses("/pricing")}
            >
              <span className={`font-semibold text-base transition-colors duration-300 ${
                isActivePath("/pricing") ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-600'
              }`}>
                Become a Host
              </span>
              <div className={getUnderlineClasses("/pricing")}></div>
            </div>

            <div 
              onClick={() => navigate('/rental-deals')}
              className={getNavLinkClasses("/rental-deals")}
            >
              <span className={`font-semibold text-base transition-colors duration-300 ${
                isActivePath("/rental-deals") ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-600'
              }`}>
                Rental Deals
              </span>
              <div className={getUnderlineClasses("/rental-deals")}></div>
            </div>

            <div 
              onClick={() => navigate('/works')}
              className={getNavLinkClasses("/works")}
            >
              <span className={`font-semibold text-base transition-colors duration-300 ${
                isActivePath("/works") ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-600'
              }`}>
                How it Works
              </span>
              <div className={getUnderlineClasses("/works")}></div>
            </div>

            <div 
              onClick={() => navigate('/fav')}
              className={getNavLinkClasses("/fav")}
            >
              <span className={`font-semibold text-base transition-colors duration-300 ${
                isActivePath("/fav") ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-600'
              }`}>
                WishList
              </span>
              <div className={getUnderlineClasses("/fav")}></div>
            </div>
          </nav>

          {/* Auth Section - Far Right */}
          <div className="flex items-center flex-shrink-0">
            {user ? (
              <div className="relative">
                {/* Modernized User Profile Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-300 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getAvatarInitial()}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-800 font-medium text-sm">
                      {getUserDisplayName()}
                    </span>
                    {user.role === 'admin' && <FaCrown className="w-3 h-3 text-yellow-500" />}
                  </div>
                  {/* Modern dropdown arrow */}
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Modernized Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 backdrop-blur-sm">
                    
                    {/* Profile Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getAvatarInitial()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {user.subscription && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">
                                {user.subscription.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center space-x-3 transition-colors"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center space-x-3 transition-colors"
                        >
                          <FaCrown className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                    </div>

                    <hr className="my-1 border-gray-100" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-base hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default NavBar;