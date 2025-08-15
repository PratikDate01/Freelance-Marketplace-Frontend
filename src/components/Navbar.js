import React, { useState } from "react";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const Navbar = ({ onSignInClick, onRegisterClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/browse-gigs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/client/browse-gigs');
    }
  };

  const handleBecomeSellerClick = () => {
    if (user) {
      if (user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        // Could redirect to role change or freelancer signup
        navigate('/freelancer/dashboard');
      }
    } else {
      onRegisterClick();
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold text-gray-800 hover:text-green-600 transition-colors">
            <span className="font-black">CodeHire</span>
            <span className="text-green-500 text-3xl align-super">.</span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What service are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  <FaSearch size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Browse Link */}
            <Link 
              to="/client/browse-gigs" 
              className="hidden sm:block text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
            >
              Browse
            </Link>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 text-gray-700 hover:text-black cursor-pointer text-sm">
              <FaGlobe />
              <span>EN</span>
            </div>

            {/* Become a Seller */}
            <button
              onClick={handleBecomeSellerClick}
              className="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
            >
              Become a Seller
            </button>

            {!user ? (
              <>
                {/* Sign In */}
                <button
                  onClick={onSignInClick}
                  className="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
                >
                  Sign In
                </button>

                {/* Join Button */}
                <button
                  onClick={onRegisterClick}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  Join
                </button>
              </>
            ) : (
              /* User is logged in */
              <div className="flex items-center gap-4">
                <Link
                  to={user.role === 'client' ? '/client/profile' : '/freelancer/dashboard'}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden sm:block">{user.name}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
              >
                <FaSearch size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
