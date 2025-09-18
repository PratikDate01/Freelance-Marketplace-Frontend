import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../config/axios";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        navigate("/client/orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await axios.post(`/api/orders/${id}/messages`, {
        message: newMessage
      });

      setNewMessage("");
      fetchOrder(); // Refresh to get new messages
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Failed to send message");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const acceptDelivery = async () => {
    try {
      const response = await axios.post(`/api/orders/${id}/accept`, {});
      alert("Delivery accepted successfully! Payment has been released to the seller.");
      fetchOrder();
    } catch (error) {
      console.error("Error accepting delivery:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        const errorMessage = error.response?.data?.message || "Failed to accept delivery";
        alert(errorMessage);
      }
    }
  };

  const requestRevision = async () => {
    if (!revisionNote.trim()) {
      alert("Please provide details for the revision");
      return;
    }

    try {
      const response = await axios.post(`/api/orders/${id}/revision`, {
        revisionNote
      });

      setShowRevisionModal(false);
      setRevisionNote("");
      alert("Revision requested successfully! The seller has been notified.");
      fetchOrder();
    } catch (error) {
      console.error("Error requesting revision:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        const errorMessage = error.response?.data?.message || "Failed to request revision";
        alert(errorMessage);
      }
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;

    setIsCancelling(true);
    try {
      const response = await axios.post(`/api/orders/${id}/cancel`, {
        reason: "Cancelled by buyer"
      });

      // Show success message
      alert("Order cancelled successfully! Refund will be processed within 3-5 business days.");
      fetchOrder();
    } catch (error) {
      console.error("Error cancelling order:", error);

      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        // Professional error handling
        let errorMessage = "Failed to cancel order. Please try again.";

        if (error.response?.status === 400) {
          errorMessage = error.response.data.message || "This order cannot be cancelled.";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have permission to cancel this order.";
        } else if (error.response?.status === 404) {
          errorMessage = "Order not found.";
        } else if (error.response?.status >= 500) {
          errorMessage = "Server error. Please try again later or contact support.";
        }

        alert(errorMessage);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      delivered: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      revision: "bg-orange-100 text-orange-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/client/orders")}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/client/orders")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Orders</span>
            </button>
            <div className="text-right">
              <h1 className="text-lg font-semibold text-gray-900">
                Order #{order?._id ? order._id.slice(-8).toUpperCase() : 'Loading...'}
              </h1>
              <p className="text-sm text-gray-600">{order?.createdAt ? formatDate(order.createdAt) : 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status)}`}>
                  {order?.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Loading...'}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-4">
                {order?.statusHistory ? order.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      index === 0 ? "bg-green-500" : "bg-gray-300"
                    }`}></div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 capitalize">{status.status}</p>
                      <p className="text-sm text-gray-600">{status.note}</p>
                      <p className="text-xs text-gray-500">{formatDate(status.timestamp)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500">Loading status history...</p>
                )}
              </div>
            </div>

            {/* Gig Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gig Details</h2>
              <div className="flex gap-4">
                <img
                  src={order?.gigImage || "https://placehold.co/100"}
                  alt={order?.gigTitle || "Gig"}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">{order?.gigTitle || "Loading..."}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={order?.sellerId?.avatar || order?.sellerId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(order?.sellerId?.name || 'Seller')}&background=10b981&color=fff`}
                      alt={order?.sellerId?.name || "Seller"}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700">{order?.sellerId?.name || "Seller"}</span>
                  </div>
                  <p className="text-sm text-gray-600">Package: {order?.packageType || "Loading..."}</p>
                  <p className="text-sm text-gray-600">Delivery: {order?.deliveryTime || "0"} days</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {order?.requirements && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{order.requirements}</p>
                </div>
              </div>
            )}

            {/* Status-specific sections */}
            {order?.status === "active" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order in Progress</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Work in Progress</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    The freelancer is working on your order. You'll be notified when it's delivered.
                  </p>
                </div>
              </div>
            )}

            {order?.status === "revision" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Revision in Progress</h2>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">Revision Requested</span>
                  </div>
                  <p className="text-sm text-orange-600">
                    The freelancer is working on your requested revisions. You'll be notified when the revision is delivered.
                  </p>
                  <p className="text-xs text-orange-500 mt-2">
                    Revisions used: {order?.revisionCount || 0}/{order?.maxRevisions || 0}
                  </p>
                </div>
              </div>
            )}

            {order?.status === "completed" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Completed</h2>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Order Completed Successfully</span>
                  </div>
                  <p className="text-sm text-green-600">
                    You have accepted the delivery and payment has been released to the freelancer. Thank you for your business!
                  </p>
                </div>
                
                {/* Show delivery details for completed orders */}
                {order?.deliveryNote && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-medium mb-2">Final Delivery:</p>
                    <p className="text-gray-700">{order.deliveryNote}</p>
                  </div>
                )}

                {order?.deliveryFiles && order.deliveryFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 mb-2">Delivered Files:</p>
                    <div className="space-y-2">
                      {order.deliveryFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show delivery section for delivered orders */}
            {order?.status === "delivered" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h2>

                {order?.deliveryNote && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <p className="text-green-800 font-medium mb-2">Seller's Note:</p>
                    <p className="text-green-700">{order.deliveryNote}</p>
                  </div>
                )}

                {order?.deliveryFiles && order.deliveryFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900 mb-2">Delivered Files:</p>
                    <div className="space-y-2">
                      {order.deliveryFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!order?.deliveryNote && !order?.deliveryFiles?.length && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800">The seller has marked this order as delivered but hasn't provided any delivery notes or files.</p>
                  </div>
                )}

                {/* Delivery Actions */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={acceptDelivery}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Accept Delivery & Release Payment
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={order?.revisionCount >= order?.maxRevisions}
                    className={`w-full py-3 px-6 rounded-lg transition-colors ${
                      order?.revisionCount >= order?.maxRevisions
                        ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border border-orange-500 text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    {order?.revisionCount >= order?.maxRevisions
                      ? `Maximum Revisions Reached (${order?.revisionCount}/${order?.maxRevisions})`
                      : `Request Revision (${order?.revisionCount}/${order?.maxRevisions})`
                    }
                  </button>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm font-medium">Escrow Protection Active</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Your payment (₹{order?.amount}) is held securely. Only release when you're completely satisfied with the delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              
              {/* Messages List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {order?.messages && order.messages.length > 0 ? (
                  order.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message?.sender?._id === order?.buyerId?._id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message?.sender?._id === order?.buyerId?._id
                          ? "bg-green-500 text-white"
                          : message?.isSystem
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        <p className="text-sm">{message?.message}</p>
                        <p className={`text-xs mt-1 ${
                          message?.sender?._id === order?.buyerId?._id
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}>
                          {formatMessageTime(message?.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No messages yet</p>
                )}
              </div>

              {/* Send Message */}
              {order?.status !== "completed" && order?.status !== "cancelled" && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service price</span>
                  <span className="font-medium">₹{order?.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">₹{order?.serviceFee}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">₹{order?.totalAmount}</span>
                </div>
              </div>

              {/* Key Info */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Delivery Date</span>
                  <p className="font-medium">{order?.deliveryDate ? formatDate(order.deliveryDate) : 'Loading...'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Status</span>
                  <p className="font-medium capitalize">{order?.paymentStatus}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Revisions Used</span>
                  <p className="font-medium">{order?.revisionCount}/{order?.maxRevisions}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {order?.status === "pending" && (
                  <button
                    onClick={cancelOrder}
                    disabled={isCancelling}
                    className={`w-full border py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isCancelling 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-red-500 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {isCancelling && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    )}
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                {order?.status === "completed" && !order?.isReviewed && order?.gigId?._id && (
                  <button
                    onClick={() => navigate(`/client/gig/${order.gigId._id}`)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Leave Review
                  </button>
                )}

                {order?.gigId?._id && (
                  <button
                    onClick={() => navigate(`/client/gig/${order.gigId._id}`)}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Gig
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Revision</h3>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Please describe what needs to be revised..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={requestRevision}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Request Revision
              </button>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default OrderDetails;