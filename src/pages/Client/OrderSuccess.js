import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { CheckCircle, Clock, User, Package } from "lucide-react";
import axios from "axios";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your order. The seller has been notified and will start working on your project.
          </p>
        </div>

        {order ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Order Header */}
            <div className="bg-green-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h2>
                  <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                  
                  {/* Gig Info */}
                  <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={order.gigImage || "https://placehold.co/80"}
                      alt={order.gigTitle}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900 mb-1">{order.gigTitle}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={order.sellerId?.avatar || order.sellerId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.sellerId?.name || 'Seller')}&background=10b981&color=fff`}
                          alt={order.sellerId?.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-700">{order.sellerId?.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">Package: {order.packageType}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {order.requirements && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Requirements</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{order.requirements}</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Placed</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment Processed</p>
                          <p className="text-xs text-gray-500">Just now</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expected Delivery</p>
                          <p className="text-xs text-gray-500">{formatDate(order.deliveryDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service price</span>
                        <span className="font-medium">₹{order.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">₹{order.serviceFee}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total paid</span>
                        <span className="text-green-600">₹{order.totalAmount}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Payment method: {order.paymentMethod || "Card"}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• The seller will start working on your order</li>
                      <li>• You'll receive updates via messages</li>
                      <li>• Delivery expected by {new Date(order.deliveryDate).toLocaleDateString()}</li>
                      <li>• You can track progress in your orders page</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/client/orders/${order._id}`)}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      View Order Details
                    </button>
                    <button
                      onClick={() => navigate("/client/orders")}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View All Orders
                    </button>
                    <button
                      onClick={() => navigate("/client/browse-gigs")}
                      className="w-full text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback for no order ID */
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl text-gray-300 mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed and the seller has been notified. 
              You can track your orders from your dashboard.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/client/orders")}
                className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors mr-4"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/client/browse-gigs")}
                className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Need help with your order?</p>
          <div className="space-x-4">
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Contact Support
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              View FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;