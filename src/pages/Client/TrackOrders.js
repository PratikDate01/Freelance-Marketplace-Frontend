import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";

const TrackOrders = ({ goBack }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [searchQuery]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders/buyer${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
      
      const ordersData = Array.isArray(response.data.orders) ? response.data.orders : [];
      setOrders(ordersData);
      
      // Calculate stats from actual data
      const computed = ordersData.reduce((acc, order) => {
        acc.total += 1;
        if (order.status === "active" || order.status === "delivered") acc.active += 1;
        if (order.status === "completed") acc.completed += 1;
        acc.totalSpent += Number(order.totalAmount || 0);
        return acc;
      }, { total: 0, active: 0, completed: 0, totalSpent: 0 });
      
      setStats(computed);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setStats({ total: 0, active: 0, completed: 0, totalSpent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      revision: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      active: "🔄",
      delivered: "📦",
      completed: "✅",
      cancelled: "❌",
      revision: "🔄"
    };
    return icons[status] || "📋";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getTimeRemaining = (deliveryDate) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days remaining`;
  };

  const getProgressPercentage = (status, createdAt, deliveryDate) => {
    const now = new Date();
    const created = new Date(createdAt);
    const delivery = new Date(deliveryDate);
    
    const totalTime = delivery - created;
    const elapsedTime = now - created;
    const timeProgress = Math.min((elapsedTime / totalTime) * 100, 100);
    
    const statusProgress = {
      pending: 10,
      active: Math.max(25, timeProgress),
      delivered: 85,
      completed: 100,
      cancelled: 0,
      revision: 60
    };
    
    return statusProgress[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-1">Monitor the progress of your orders</p>
            </div>
            <button
              onClick={goBack || (() => navigate(-1))}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative max-w-sm w-full">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders (title, seller)"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => navigate("/client/browse-gigs")}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <img
                        src={order.gigId?.image || "https://placehold.co/80"}
                        alt={order.gigTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{order.gigTitle}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={order.sellerId?.avatar || order.sellerId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.sellerId?.name || 'Seller')}&background=10b981&color=fff`}
                            alt={order.sellerId?.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{order.sellerId?.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-2">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(getProgressPercentage(order.status, order.createdAt, order.deliveryDate))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          order.status === "completed" ? "bg-green-500" :
                          order.status === "cancelled" ? "bg-red-500" :
                          "bg-blue-500"
                        }`}
                        style={{ width: `${getProgressPercentage(order.status, order.createdAt, order.deliveryDate)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className={`text-center p-3 rounded-lg ${
                      ["pending", "active", "delivered", "completed", "cancelled"].includes(order.status) 
                        ? "bg-green-50 text-green-700" 
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      <div className="text-lg mb-1">📝</div>
                      <p className="text-xs font-medium">Order Placed</p>
                      <p className="text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    
                    <div className={`text-center p-3 rounded-lg ${
                      ["active", "delivered", "completed"].includes(order.status)
                        ? "bg-green-50 text-green-700" 
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      <div className="text-lg mb-1">🔄</div>
                      <p className="text-xs font-medium">In Progress</p>
                      <p className="text-xs">
                        {["active", "delivered", "completed"].includes(order.status) ? "Active" : "Pending"}
                      </p>
                    </div>
                    
                    <div className={`text-center p-3 rounded-lg ${
                      ["delivered", "completed"].includes(order.status)
                        ? "bg-green-50 text-green-700" 
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      <div className="text-lg mb-1">📦</div>
                      <p className="text-xs font-medium">Delivered</p>
                      <p className="text-xs">
                        {order.status === "delivered" || order.status === "completed" ? "Delivered" : "Pending"}
                      </p>
                    </div>
                    
                    <div className={`text-center p-3 rounded-lg ${
                      order.status === "completed"
                        ? "bg-green-50 text-green-700" 
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      <div className="text-lg mb-1">✅</div>
                      <p className="text-xs font-medium">Completed</p>
                      <p className="text-xs">
                        {order.status === "completed" ? "Done" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Delivery Timeline</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        Expected delivery: {formatDate(order.deliveryDate)} • {getTimeRemaining(order.deliveryDate)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/client/orders/${order._id}`)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {order.status === "active" && (
                      <button 
                        onClick={async () => {
                          try {
                            const resp = await axios.post('/api/chat/conversations', { orderId: order._id });
                            const convId = resp.data?._id;
                            if (convId) {
                              navigate(`/client/messages?conversation=${convId}`);
                            } else {
                              navigate(`/client/orders/${order._id}`);
                            }
                          } catch (e) {
                            console.error('Open chat failed:', e);
                            navigate(`/client/orders/${order._id}`);
                          }
                        }}
                        className="flex-1 border border-blue-500 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                        Open Chat
                      </button>
                    )}
                    
                    {order.status === "delivered" && (
                      <button className="flex-1 border border-green-500 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                        Review Delivery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrders;