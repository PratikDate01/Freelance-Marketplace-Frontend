import React, { useState } from "react";
import BrowseGigs from "./BrowseGigs";
import Orders from "./Orders";
import TrackOrders from "./TrackOrders";
import GigDetails from "./GigDetails"; // ✅ Import GigDetails
import ProtectedRoute from "../../components/ProtectedRoute";

const ClientProfile = () => {
  const [page, setPage] = useState("profile");
  const [selectedGig, setSelectedGig] = useState(null); // ✅ Track selected gig

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 text-center">
      {page === "profile" && (
        <>
          <h1 className="text-4xl font-bold mb-6">👋 Welcome, Client!</h1>
          <p className="text-gray-600 mb-10">
            What would you like to do today?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setPage("browse")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              🔍 Browse Gigs
            </button>
            <button
              onClick={() => setPage("orders")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
            >
              📦 My Orders
            </button>
            <button
              onClick={() => setPage("track")}
              className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600"
            >
              📊 Track Order Status
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
            >
              🚪 Logout
            </button>
          </div>
        </>
      )}

      <ProtectedRoute>
        {page === "browse" && (
          <BrowseGigs
            goBack={() => setPage("profile")}
            onGigSelect={(gig) => {
              setSelectedGig(gig);
              setPage("gigDetails");
            }}
          />
        )}

        {page === "gigDetails" && (
          <GigDetails
            gig={selectedGig}
            goBack={() => setPage("browse")}
          />
        )}

        {page === "orders" && (
          <Orders goBack={() => setPage("profile")} />
        )}

        {page === "track" && (
          <TrackOrders goBack={() => setPage("profile")} />
        )}
      </ProtectedRoute>
    </div>
  );
};

export default ClientProfile;
