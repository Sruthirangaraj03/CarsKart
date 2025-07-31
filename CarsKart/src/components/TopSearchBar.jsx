// src/components/TopSearchBar.jsx
import { useState } from "react";
import { FaSearchLocation } from "react-icons/fa";

const TopSearchBar = () => {
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [untilDate, setUntilDate] = useState("");
  const [untilTime, setUntilTime] = useState("");

  const handleSearch = () => {
    alert(
      `Searching cars from ${fromDate} ${fromTime} to ${untilDate} ${untilTime} at ${location}`
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-full px-4 py-3 w-full max-w-5xl mx-auto mt-6 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 border border-orange-100/50 hover:bg-white/95 transition-all duration-300">
      {/* Location Input */}
      <div className="flex flex-col flex-1 min-w-[180px]">
        <label className="text-xs text-gray-500 font-medium mb-1">Where</label>
        <input
          type="text"
          placeholder="City, airport, address or hotel"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm focus:outline-none bg-transparent placeholder-gray-400 focus:placeholder-gray-300 transition-colors duration-200"
        />
      </div>

      {/* From Date and Time */}
      <div className="flex flex-col min-w-[180px]">
        <label className="text-xs text-gray-500 font-medium mb-1">From</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm focus:outline-none border border-orange-200 rounded px-2 py-1 focus:border-orange-400 transition-colors duration-200"
          />
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="text-sm focus:outline-none border border-orange-200 rounded px-2 py-1 focus:border-orange-400 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Until Date and Time */}
      <div className="flex flex-col min-w-[180px]">
        <label className="text-xs text-gray-500 font-medium mb-1">Until</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={untilDate}
            onChange={(e) => setUntilDate(e.target.value)}
            className="text-sm focus:outline-none border border-orange-200 rounded px-2 py-1 focus:border-orange-400 transition-colors duration-200"
          />
          <input
            type="time"
            value={untilTime}
            onChange={(e) => setUntilTime(e.target.value)}
            className="text-sm focus:outline-none border border-orange-200 rounded px-2 py-1 focus:border-orange-400 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-full hover:from-orange-600 hover:to-orange-700 hover:scale-105 transform transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaSearchLocation size={18} />
      </button>
    </div>
  );
};

export default TopSearchBar;