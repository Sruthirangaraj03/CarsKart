import axios from "axios";

const API_BASE_URL = "https://carskart-backend.onrender.com";

console.log("🔗 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper function to safely get token
const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error reading token:", error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = () => {
  try {
    const loginTime = localStorage.getItem("loginTime");
    if (!loginTime) return true;

    const elapsed = Date.now() - parseInt(loginTime);
    const threeHours = 3 * 60 * 60 * 1000;
    return elapsed >= threeHours;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
};

// Helper function to clear auth data
const clearAuthData = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    console.log("🧹 Auth data cleared");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// Attach token automatically to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Check if token exists and is not expired
    if (token) {
      if (isTokenExpired()) {
        console.warn("⚠️ Token expired, clearing auth data");
        clearAuthData();
        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired"));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized - Clearing auth data");
      clearAuthData();
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { clearAuthData, isTokenExpired };