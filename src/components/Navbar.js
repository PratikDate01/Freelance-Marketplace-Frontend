import React from "react";
import { FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = ({ onSignInClick, onRegisterClick }) => {
  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-extrabold text-gray-800">
        <span className="font-black">CodeHire</span>
        <span className="text-green-500 text-3xl align-super">.</span>
      </Link>

      {/* Navigation Links */}
      <ul className="flex items-center gap-6 text-gray-700 font-medium text-sm">
       
        <li className="flex items-center gap-1 hover:text-black cursor-pointer">
          <FaGlobe />
          EN
        </li>
        <li className="hover:text-black cursor-pointer">Become a Seller</li>

        {/* Sign In & Join */}
        <li onClick={onSignInClick} className="hover:text-black cursor-pointer">
          Sign In
        </li>
        <li>
          <button
            onClick={onRegisterClick}
            className="border border-black rounded px-4 py-1 hover:bg-gray-100 transition"
          >
            Join
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
