// client/src/Layouts/PublicLayout.js
import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="px-4 py-6">
        <Outlet /> 
      </div>
    </div>
  );
};

export default PublicLayout;
