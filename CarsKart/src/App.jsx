import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import LandingPage from "./pages/landingpage";
import PricingPlans from "./pages/pricingpage";
function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={token ? <LandingPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<PricingPlans />} />
      </Routes>
    </Router>
  );
}

export default App;
