import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { FiBell, FiMail, FiHeart, FiSearch } from "react-icons/fi";

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "freelancer") {
        navigate("/freelancer/profile");
      } else if (user.role === "client") {
        navigate("/client/profile");
      }
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getAvatarLetter = () => {
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "?";
  };

  const getProfileLink = () => {
    if (user?.role === "freelancer") return "/freelancer/profile";
    if (user?.role === "client") return "/client/profile";
    return "#";
  };

  return (
    
    <nav className="bg-white shadow-sm px-6 py-3 sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to={getProfileLink()} className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="text-green-600">CodeHire</span>
          <span className="text-green-500 ml-1">.</span>
        </Link>

        <div className="flex items-center border rounded overflow-hidden w-[500px]">
          <input
            type="text"
            placeholder="What service are you looking for today?"
            className="px-4 py-2 w-full outline-none"
          />
          <button className="bg-gray-900 text-white px-4 py-2">
            <FiSearch />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <FiBell className="text-xl text-gray-700 cursor-pointer" />
          <FiMail className="text-xl text-gray-700 cursor-pointer" />
          <FiHeart className="text-xl text-gray-700 cursor-pointer" />
          <Link to="#" className="text-gray-700 hover:text-green-600">
            Orders
          </Link>

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg"
              >
                {getAvatarLetter()}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-xl rounded overflow-hidden z-20 text-sm">
                  <p className="px-4 py-2 font-semibold text-gray-800">
                    Welcome, {user.name || user.email}
                  </p>

                  <Link to={getProfileLink()} className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link to="#" className="block px-4 py-2 hover:bg-gray-100">
                    Post a project brief
                  </Link>
                  <Link to="#" className="block px-4 py-2 hover:bg-gray-100">
                    Your briefs
                  </Link>
                  <Link to="#" className="block px-4 py-2 hover:bg-gray-100 text-green-600">
                    Refer a friend
                  </Link>
                  <Link to="#" className="block px-4 py-2 hover:bg-gray-100">
                    Become a Seller
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">
                    Account settings
                  </Link>
                  <Link to="#" className="block px-4 py-2 hover:bg-gray-100">
                    Billing and payments
                  </Link>

                  <hr className="my-1" />

                  <div className="flex items-center justify-between px-4 py-2">
                    <span>Exclusive features</span>
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Fiverr Pro
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
