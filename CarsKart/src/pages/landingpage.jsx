import React from "react";
import NavBar from "../components/NavBar";
import TopSearchBar from "../components/TopSearchBar";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-white relative overflow-hidden flex flex-col">
      {/* Fixed NavBar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavBar />
      </div>

      {/* Push content down below fixed NavBar and SearchBar */}
      <div className="pt-32 px-4 sm:px-6 lg:px-8">
        {/* Search Bar just below NavBar */}
        <div className="mb-10">
          <TopSearchBar />
        </div>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold max-w-4xl leading-tight text-gray-900">
              <span>Find, Book, and </span>
              <span className="text-orange-600">Rent a car</span>
              <span> in Easy Steps.</span>
            </h1>
            <p className="mt-6 text-gray-600 max-w-xl text-lg mx-auto">
              Get a car wherever and whenever you need it with our{" "}
              <span className="text-orange-500 font-semibold">CarsKart</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;