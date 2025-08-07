// client/src/pages/Client/BrowseGigs.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BrowseGigs = ({ goBack, onGigSelect }) => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/gigs");
        setGigs(res.data);
      } catch (err) {
        console.error("Failed to fetch gigs:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={goBack}
        className="mb-4 text-blue-600 underline hover:text-blue-800 text-sm"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6">Explore Freelance Gigs</h1>

      {loading ? (
        <p className="text-gray-500">Loading gigs...</p>
      ) : gigs.length === 0 ? (
        <p>No gigs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="border rounded-lg shadow-sm hover:shadow-lg cursor-pointer transition duration-200 overflow-hidden bg-white"
              onClick={() => {
                // Use route-based navigation instead of state-based
                if (onGigSelect) {
                  onGigSelect(gig); // Keep backward compatibility
                } else {
                  navigate(`/client/gig/${gig._id}`); // Route-based navigation
                }
              }}
            >
              <img
                src={gig.image || "https://via.placeholder.com/300"}
                alt={gig.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{gig.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{gig.description}</p>
                <div className="mt-2">
                  <span className="text-green-600 font-bold">₹{gig.price}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    • {gig.deliveryTime} day(s) delivery
                  </span>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  Seller: {gig?.sellerId?.name || "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseGigs;
