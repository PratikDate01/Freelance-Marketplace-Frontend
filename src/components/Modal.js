import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg relative overflow-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-2xl text-gray-500 hover:text-black"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
