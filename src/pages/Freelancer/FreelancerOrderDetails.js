import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FreelancerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Delivery states
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  
  // Revision states
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionResponse, setRevisionResponse] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      console.log("Fetched order data:", response.data); // Debug log, remove in production
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/freelancer/orders");
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
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setNewMessage("");
      fetchOrder(); // Refresh to get new messages
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const deliverOrder = async () => {
    if (!deliveryNote.trim()) {
      alert("Please provide a delivery note");
      return;
    }

    setSubmittingDelivery(true);
    try {
      await axios.post(`/api/orders/${id}/deliver`, {
        deliveryNote,
        deliveryFiles
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setShowDeliveryModal(false);
      setDeliveryNote("");
      setDeliveryFiles([]);
      alert("Order delivered successfully! The client will be notified.");
      fetchOrder();
    } catch (error) {
      console.error("Error delivering order:", error);
      const errorMessage = error.response?.data?.message || "Failed to deliver order";
      alert(errorMessage);
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const submitRevision = async () => {
    if (!revisionResponse.trim()) {
      alert("Please provide details about the revision");
      return;
    }

    setSubmittingRevision(true);
    try {
      // Use the same deliver endpoint - backend now handles revision status
      await axios.post(`/api/orders/${id}/deliver`, {
        deliveryNote: revisionResponse,
        deliveryFiles
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setShowRevisionModal(false);
      setRevisionResponse("");
      setDeliveryFiles([]);
      alert("Revision submitted successfully! The client will be notified.");
      fetchOrder();
    } catch (error) {
      console.error("Error submitting revision:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit revision";
      alert(errorMessage);
    } finally {
      setSubmittingRevision(false);
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
            onClick={() => navigate("/freelancer/orders")}
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
              onClick={() => navigate("/freelancer/orders")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Orders</span>
            </button>
            <div className="text-right">
              <h1 className="text-lg font-semibold text-gray-900">
                Order #{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}
              </h1>
              <p className="text-sm text-gray-600">{order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</p>
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
                  {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-4">
                {Array.isArray(order?.statusHistory) && order.statusHistory.length > 0 ? order.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      index === 0 ? "bg-green-500" : "bg-gray-300"
                    }`}></div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 capitalize">{status.status || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{status.note || ''}</p>
                      <p className="text-xs text-gray-500">{status?.timestamp ? formatDate(status.timestamp) : 'N/A'}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500">No status history available</p>
                )}
              </div>
            </div>

            {/* Gig Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gig Details</h2>
              <div className="flex gap-4">
                <img
                  src={order.gigImage || "https://placehold.co/100"}
                  alt={order.gigTitle}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">{order.gigTitle}</h3>
                  <div className="flex items-center gap-2 mb-2">
                <img
                  src={order.buyerId?.avatar || order.buyerId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.buyerId?.name || 'Client')}&background=10b981&color=fff`}
                  alt={order.buyerId?.name || 'Client'}
                  className="w-6 h-6 rounded-full"
                />
                    <span className="text-sm text-gray-700">{order.buyerId?.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">Package: {order.packageType}</p>
                  <p className="text-sm text-gray-600">Delivery: {order.deliveryTime} days</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {order.requirements && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Requirements</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{order.requirements}</p>
                </div>
              </div>
            )}

            {/* Revision Request */}
            {order.status === "revision" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Revision Requested</h2>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <p className="text-orange-800 font-medium mb-2">Client's Revision Request:</p>
                  {order.messages
                    .filter(msg => msg.message.includes("I need some revisions:"))
                    .slice(-1)
                    .map((msg, index) => (
                      <p key={index} className="text-orange-700">
                        {msg.message.replace("I need some revisions: ", "")}
                      </p>
                    ))
                  }
                  {order.messages.filter(msg => msg.message.includes("I need some revisions:")).length === 0 && (
                    <p className="text-orange-700">
                      The client has requested revisions to this order. Please check the messages for details.
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                  >
                    Submit Revision
                  </button>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Revision Required</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      The client has requested revisions. Please review their feedback and submit your revised work.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Actions for Active Orders */}
            {order.status === "active" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Deliver Work</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Deliver Order
                  </button>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Ready to Deliver?</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Once you deliver the work, the client will have the option to accept or request revisions.
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
                {Array.isArray(order.messages) && order.messages.length > 0 ? (
                  order.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.sender?._id === order.sellerId?._id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender?._id === order.sellerId?._id
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message || ''}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender?._id === order.sellerId?._id
                              ? "text-green-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp ? formatMessageTime(message.timestamp) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>

              {/* Message Input */}
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
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium">{order.packageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">₹{order?.amount && !isNaN(order.amount) ? order.amount : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">₹{order?.serviceFee && !isNaN(order.serviceFee) ? order.serviceFee : 0}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Your Earnings</span>
                  <span className="text-green-600">₹{((order?.amount && !isNaN(order.amount) ? order.amount : 0) - (order?.serviceFee && !isNaN(order.serviceFee) ? order.serviceFee : 0))}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Time</span>
                  <span className="font-medium">{order.deliveryTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-medium">
                    {order?.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revisions</span>
                  <span className="font-medium">{order.revisionCount}/{order.maxRevisions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliver Order</h3>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Describe your delivery and any important notes for the client..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={deliverOrder}
                disabled={submittingDelivery}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {submittingDelivery ? "Delivering..." : "Deliver Order"}
              </button>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Revision</h3>
            <textarea
              value={revisionResponse}
              onChange={(e) => setRevisionResponse(e.target.value)}
              placeholder="Describe the changes you've made based on the client's feedback..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={submitRevision}
                disabled={submittingRevision}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submittingRevision ? "Submitting..." : "Submit Revision"}
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

export default FreelancerOrderDetails;