import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const loginTime = localStorage.getItem('loginTime');
        if (token && loginTime) {
          const elapsed = Date.now() - parseInt(loginTime);
          const threeHours = 3 * 60 * 60 * 1000;
          if (elapsed < threeHours) {
            navigate('/');
            return;
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
        clearAuthData();
      }
    };
    checkExistingAuth();
  }, [navigate]);

  // Auto-logout timer setup
  const setupAutoLogout = () => {
    const threeHours = 3 * 60 * 60 * 1000;
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        clearAuthData();
        alert('🔐 Your session has expired for security reasons. Please login again.');
        window.location.href = '/login';
      }
    }, threeHours);
    console.log('⏰ Auto-logout timer set for 3 hours');
  };

  // Clear authentication data
  const clearAuthData = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      console.log('🧹 Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Save token
  const saveToken = (token) => {
    try {
      if (window.localStorage) {
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('loginTime', Date.now().toString());
        console.log('✅ Token saved successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to save token:', error);
      return false;
    }
    return false;
  };

  // Save user data
  const saveUserData = (userData) => {
    try {
      if (window.localStorage) {
        const userWithTimestamp = { ...userData, loginTime: Date.now() };
        window.localStorage.setItem('user', JSON.stringify(userWithTimestamp));
        console.log('✅ User data saved successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to save user data:', error);
      return false;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      alert("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isLogin && (!name || !phone)) {
      alert("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      let res;
      if (isLogin) {
        // LOGIN - Use /api to trigger Vite proxy
        res = await axios.post("/api/auth/login", {
          email,
          password,
        });
        console.log("✅ Login success:", res.data);

        const { token, user } = res.data;

        if (!token) {
          throw new Error("No token received from server");
        }

        saveToken(token);
        saveUserData(user);
        setupAutoLogout();

        alert(`🎉 Welcome back, ${user.name || user.email}!`);

        if (user.role === 'admin') {
          navigate("/admin");
        } else if (user.subscription) {
          navigate("/dashboard");
        } else {
          navigate("/pricing");
        }
      } else {
        // SIGNUP - Use /api to trigger Vite proxy
        res = await axios.post("/api/auth/signup", {
          name,
          email,
          phone,
          password,
        });
        console.log("✅ Signup success:", res.data);

        const { token, user } = res.data;

        if (!token) {
          throw new Error("No token received from server");
        }

        saveToken(token);
        saveUserData(user);
        setupAutoLogout();

        alert(`🎉 Account created successfully! Welcome, ${user.name || user.email}!`);
        navigate("/pricing");
      }
    } catch (err) {
      console.error("❌ Authentication error:", err);

      if (err.response) {
        const errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
        alert(`❌ ${errorMessage}`);
      } else if (err.request) {
        alert("❌ Network error. Please check your connection and try again.");
      } else {
        alert(`❌ ${err.message || "Something went wrong"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "Welcome Back" : "Create an account"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? "Login to continue" : "Sign up to get started"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                  required={!isLogin}
                  disabled={isLoading}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                  required={!isLogin}
                  disabled={isLoading}
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
              required
              disabled={isLoading}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                required={!isLogin}
                disabled={isLoading}
              />
            )}

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  required={!isLogin}
                  disabled={isLoading}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to all the{" "}
                  <span className="text-orange-600 underline cursor-pointer">
                    Terms & Conditions
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isLogin ? "Logging in..." : "Creating account..."}
                </span>
              ) : (
                <span>{isLogin ? "Log in" : "Sign up"}</span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <p className="text-center text-gray-600 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => !isLoading && setIsLogin(!isLogin)}
              className={`text-orange-600 underline ${
                isLoading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:text-orange-700"
              }`}
            >
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>

          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 flex items-center gap-2">
              <span>🔒</span>
              <span>Your session will automatically expire after 3 hours for security.</span>
            </p>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
            <div className="text-center space-y-6">
              <h3 className="text-5xl font-bold drop-shadow-lg">
                Welcome to CarsKart
              </h3>
              <p className="text-xl opacity-90">
                Your trusted car rental platform
              </p>
              <div className="flex gap-4 justify-center mt-8">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <p className="text-sm font-semibold">🚗 Wide Selection</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <p className="text-sm font-semibold">💰 Best Prices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold text-lg">
              {isLogin ? "Logging you in..." : "Creating your account..."}
            </p>
            <p className="text-gray-500 text-sm mt-2">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;