import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const BackButton = ({ 
  to, 
  label = "Back", 
  className = "", 
  variant = "default",
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const baseClasses = "inline-flex items-center gap-2 transition-all duration-200 font-medium";
  
  const variants = {
    default: "text-gray-600 hover:text-gray-900",
    primary: "text-green-600 hover:text-green-700",
    secondary: "text-blue-600 hover:text-blue-700",
    minimal: "text-gray-500 hover:text-gray-700 text-sm",
    button: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm",
    ghost: "hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg"
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <ChevronLeft size={16} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;