import React, { useState } from "react";
import CreateGig from "./CreateGig";
import MyGigs from "./MyGigs";
import EditGig from "./EditGig";
import ProtectedRoute from "../components/ProtectedRoute";

const FreelancerProfile = () => {
  const [page, setPage] = useState("profile");
  const [editGigData, setEditGigData] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 text-center">
      {page === "profile" && (
        <>
          <h1 className="text-4xl font-bold mb-6">👋 Welcome, Freelancer!</h1>
          <p className="text-gray-600 mb-10">
            What would you like to do today?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setPage("create")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
            >
              ➕ Create Gig
            </button>
            <button
              onClick={() => setPage("mygigs")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              📁 My Gigs
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 col-span-1 sm:col-span-2"
            >
              🚪 Logout
            </button>
          </div>
        </>
      )}

      <ProtectedRoute>
        {page === "create" && (
          <CreateGig goBack={() => setPage("profile")} />
        )}

        {page === "mygigs" && (
          <MyGigs
            goBack={() => setPage("profile")}
            onEdit={(gig) => {
              setEditGigData(gig);
              setPage("edit");
            }}
          />
        )}

        {page === "edit" && editGigData && (
          <EditGig
            gigData={editGigData}
            goBack={() => {
              setEditGigData(null);
              setPage("mygigs");
            }}
          />
        )}
      </ProtectedRoute>
    </div>
  );
};

export default FreelancerProfile;
