// utils/auth.js - Create this new file

const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

/**
 * Save authentication token and setup session
 */
export const saveToken = (token) => {
  try {
    if (!window.localStorage) {
      console.error('localStorage not available');
      return false;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('loginTime', Date.now().toString());
    console.log('✅ Token saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to save token:', error);
    return false;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (userData) => {
  try {
    if (!window.localStorage) {
      console.error('localStorage not available');
      return false;
    }
    
    const userWithTimestamp = {
      ...userData,
      loginTime: Date.now()
    };
    
    localStorage.setItem('user', JSON.stringify(userWithTimestamp));
    console.log('✅ User data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    return false;
  }
};

/**
 * Get stored token
 */
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
};

/**
 * Get stored user data
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  try {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return true;

    const elapsed = Date.now() - parseInt(loginTime);
    return elapsed >= SESSION_DURATION;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Get remaining session time in milliseconds
 */
export const getRemainingSessionTime = () => {
  try {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return 0;

    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_DURATION - elapsed;
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('Error calculating remaining time:', error);
    return 0;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    console.log('🧹 Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  return token && !isTokenExpired();
};

/**
 * Setup auto-logout timer
 * Returns the timeout ID so it can be cleared if needed
 */
export const setupAutoLogout = (onLogout) => {
  const remainingTime = getRemainingSessionTime();
  
  if (remainingTime <= 0) {
    // Already expired
    onLogout();
    return null;
  }

  console.log(`⏰ Auto-logout timer set for ${Math.round(remainingTime / 1000 / 60)} minutes`);
  
  const timeoutId = setTimeout(() => {
    console.log('🔒 Session expired - logging out');
    clearAuthData();
    
    if (onLogout) {
      onLogout();
    } else {
      alert('🔐 Your session has expired for security reasons. Please login again.');
      window.location.href = '/login';
    }
  }, remainingTime);

  return timeoutId;
};

/**
 * Extend session (call this on user activity)
 */
export const extendSession = () => {
  try {
    const token = getToken();
    if (token && !isTokenExpired()) {
      localStorage.setItem('loginTime', Date.now().toString());
      console.log('✅ Session extended');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error extending session:', error);
    return false;
  }
};