import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true); // Login first
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Safe localStorage operations
  const saveToken = (token) => {
    try {
      if (window.localStorage) {
        window.localStorage.setItem('token', token);
        console.log('✅ Token saved successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to save token:', error);
      return false;
    }
    return false;
  };

  const saveUserData = (userData) => {
    try {
      if (window.localStorage) {
        window.localStorage.setItem('user', JSON.stringify(userData));
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
        // LOGIN REQUEST
        res = await axios.post("http://localhost:8000/api/auth/login", {
          email,
          password,
        });
        
        console.log("✅ Login success:", res.data);
        
        // Extract token and user data from response
        const { token, user } = res.data;
        
        if (!token) {
          throw new Error("No token received from server");
        }
        
        // Save token and user data to localStorage
        const tokenSaved = saveToken(token);
        const userSaved = saveUserData(user);
        
        if (!tokenSaved) {
          alert("⚠️ Warning: Unable to save login session. You may need to login again.");
        }
        
        // Success message
        alert(`🎉 Welcome back, ${user.name || user.email}!`);
        
        // Navigate to home page
        navigate("/");
        
      } else {
        // SIGNUP REQUEST
        res = await axios.post("http://localhost:8000/api/auth/signup", {
          name,
          email,
          phone,
          password,
        });
        
        console.log("✅ Signup success:", res.data);
        
        // Extract token and user data from response
        const { token, user } = res.data;
        
        if (!token) {
          throw new Error("No token received from server");
        }
        
        // Save token and user data to localStorage
        const tokenSaved = saveToken(token);
        const userSaved = saveUserData(user);
        
        if (!tokenSaved) {
          alert("⚠️ Warning: Unable to save login session. You may need to login again.");
        }
        
        // Success message
        alert(`🎉 Account created successfully! Welcome, ${user.name || user.email}!`);
        
        // Navigate to home page
        navigate("/");
      }
      
    } catch (err) {
      console.error("❌ Authentication error:", err);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
        alert(`❌ ${errorMessage}`);
      } else if (err.request) {
        // Request was made but no response received
        alert("❌ Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        alert(`❌ ${err.message || "Something went wrong"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side: Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-10 bg-white">
        <h2 className="text-4xl font-extrabold text-orange-600 mb-10 tracking-tight">
          {isLogin ? "Welcome Back" : "Create an account"}
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required={!isLogin}
                disabled={isLoading}
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required={!isLogin}
                disabled={isLoading}
              />
            </>
          )}

          <input
            type="email"
            placeholder="johndoe@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            required
            disabled={isLoading}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              required
              disabled={isLoading}
            />
            <div
              className="absolute top-3 right-4 text-gray-600 cursor-pointer hover:text-orange-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              required={!isLogin}
              disabled={isLoading}
            />
          )}

          {!isLogin && (
            <label className="flex items-center text-sm text-gray-600">
              <input 
                type="checkbox" 
                className="mr-2 accent-orange-500" 
                required={!isLogin}
                disabled={isLoading}
              />
              I agree to all the{" "}
              <a href="#" className="text-orange-600 underline ml-1 hover:text-orange-700">
                Terms & Conditions
              </a>
            </label>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg transition-all duration-200 font-semibold ${
              isLoading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 active:transform active:scale-95'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? "Logging in..." : "Creating account..."}
              </span>
            ) : (
              isLogin ? "Log in" : "Sign up"
            )}
          </button>

          <div className="text-center text-gray-500 text-sm">Or</div>

          <div className="flex justify-center">
            <button 
              type="button"
              className="py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-100 w-full transition-colors duration-200"
              disabled={isLoading}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 inline mr-2"
              />
              Continue with Google
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => !isLoading && setIsLogin(!isLogin)}
              className={`text-orange-600 underline ${
                isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-orange-700'
              }`}
            >
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </form>
      </div>

      {/* Right Side: Image */}
      <div className="w-1/2 h-screen">
        <img
          src="https://i.pinimg.com/736x/99/8e/5f/998e5ff90f01d95be462a42626ea3fa1.jpg"
          alt="Car Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-700">
              {isLogin ? "Logging you in..." : "Creating your account..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;