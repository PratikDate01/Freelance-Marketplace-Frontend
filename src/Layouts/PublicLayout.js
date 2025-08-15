// client/src/Layouts/PublicLayout.js
import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import Breadcrumb from "../components/Breadcrumb";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet /> 
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">FreelanceHub</h3>
              <p className="text-gray-600 text-sm">
                Connect with talented freelancers and get your projects done efficiently.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">For Clients</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Browse Services</a></li>
                <li><a href="#" className="hover:text-gray-900">Post a Project</a></li>
                <li><a href="#" className="hover:text-gray-900">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Become a Seller</a></li>
                <li><a href="#" className="hover:text-gray-900">Success Stories</a></li>
                <li><a href="#" className="hover:text-gray-900">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
