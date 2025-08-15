import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-b-2 border-green-500 mx-auto mb-4 ${sizeClasses.xlarge}`}></div>
          <p className={`text-gray-600 font-medium ${textSizeClasses.large}`}>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-green-500 mb-4 ${sizeClasses[size]}`}></div>
      <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;