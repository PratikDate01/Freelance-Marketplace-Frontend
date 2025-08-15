import React from "react";
import BackButton from "./BackButton";

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backButtonProps = {}, 
  children,
  className = "",
  variant = "default" 
}) => {
  const variants = {
    default: "bg-white border-b",
    gradient: "bg-gradient-to-r from-green-50 to-blue-50 border-b",
    minimal: "bg-gray-50",
    dark: "bg-gray-900 text-white"
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <BackButton 
                variant="ghost"
                {...backButtonProps}
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;