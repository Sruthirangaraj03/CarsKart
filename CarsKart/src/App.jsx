import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar"; // Import your NavBar component
import LoginPage from "./pages/loginpage";
import LandingPage from "./pages/landingpage";
import PricingPlans from "./pages/pricingpage";
import ProductManagementPage from "./pages/productpage";
import AddProductPage from "./pages/addProduct";
import RentalDealsPage from "./pages/rental";
import ProductDetails from "./pages/Details"; // Your product details component
import BookingPage from "./pages/bookingpage"; // Your booking/checkout component
import FavoritesPage from "./pages/favorites";
import HowItWorksPage from "./pages/howitworks";

// Component to conditionally render NavBar
function Layout({ children }) {
  const location = useLocation();
  const hideNavBarRoutes = ['/login']; // Add routes where you don't want navbar
  const showNavBar = !hideNavBarRoutes.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar />}
      <div className={showNavBar ? "pt-20" : ""}>
        {children}
      </div>
    </>
  );
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={token ? <LandingPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPlans />} />
          <Route path="/host-dashboard" element={<ProductManagementPage />} />
          <Route path="/add-product" element={token ? <AddProductPage /> : <Navigate to="/login" />} />
          <Route path="/rental-deals" element={<RentalDealsPage />} />
          <Route path="/works" element={<HowItWorksPage />} />
          
          {/* Product details route - for "See Details" button */}
          <Route 
            path="/product/:productId" 
            element={<ProductDetails />} 
          />
          
          {/* Booking route - for "Book Now" button */}
          <Route 
            path="/book" 
            element={token ? <BookingPage /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/fav" 
            element={token ? <FavoritesPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;