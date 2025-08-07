import React from "react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Order Placed!</h1>
      <p className="text-gray-600 mb-6">You can track your order from "My Orders".</p>
      <button
        onClick={() => navigate("/client/orders")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go to My Orders
      </button>
    </div>
  );
};

export default OrderSuccess;
