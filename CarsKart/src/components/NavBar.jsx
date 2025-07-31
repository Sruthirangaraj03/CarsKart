// src/components/NavBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-100/50 fixed top-2 left-0 right-0 z-50">
      <div className="flex justify-between items-center h-20 px-6 md:px-12">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 text-orange-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8"
            >
              <path d="M5 16v2h14v-2h-14zm7-11c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl text-gray-900">CarsKart</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-8 text-base text-gray-700 font-semibold">
            <span onClick={() => navigate("/pricing")}
                className="cursor-pointer hover:text-orange-600 transition-colors duration-200">Become a Renter</span>

            <a href="#" className="hover:text-orange-600 transition-colors duration-200">Rental Deals</a>
            <a href="#" className="hover:text-orange-600 transition-colors duration-200">How it Works?</a>
            <a href="#" className="hover:text-orange-600 transition-colors duration-200">Why Choose Us?</a>
          </nav>

          <button
            onClick={() => navigate("/login")}
            className="hidden md:block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-md font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            LOGIN / REGISTER
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;