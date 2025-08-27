import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, AlertCircle, RefreshCw, Star, MessageCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import BackButton from "../../components/BackButton";
import { formatPrice, convertINRToUSD } from "../../utils/currency";
import axios from "../../config/axios";

const Orders = ({ goBack }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
      const searchFilter = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
      const response = await axios.get(`/api/orders/buyer?page=${page}${statusFilter}${searchFilter}`);
      
      // Ensure we always set an array
      setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
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
      month: "short",
      day: "numeric"
    });
  };

  const getOrderProgress = (status) => {
    const progress = {
      pending: 25,
      active: 50,
      delivered: 75,
      completed: 100,
      cancelled: 0,
      revision: 60
    };
    return progress[status] || 0;
  };

  const tabs = [
    { key: "all", label: "All Orders", count: pagination.total },
    { key: "active", label: "Active", count: 0 },
    { key: "delivered", label: "Delivered", count: 0 },
    { key: "completed", label: "Completed", count: 0 }
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="My Orders"
        subtitle="Track and manage your orders"
        showBackButton={true}
        backButtonProps={{
          onClick: goBack || (() => navigate(-1)),
          label: "Back"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs + Search */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.key
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.key === "all" && pagination.total > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {pagination.total}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="relative max-w-xs w-full">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders (title, seller)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "all" 
                ? "You haven't placed any orders yet. Start by browsing our gigs!"
                : `No ${activeTab} orders found.`
              }
            </p>
            <button
              onClick={() => navigate("/client/browse-gigs")}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <img
                        src={order.gigId?.image || "https://placehold.co/80"}
                        alt={order.gigTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{getOrderProgress(order.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getOrderProgress(order.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Delivery:</span>
                      <p className="font-medium">{formatDate(order.deliveryDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Package:</span>
                      <p className="font-medium capitalize">{order.packageType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <p className="font-medium capitalize">{order.paymentStatus}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/client/orders/${order._id}`)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {order.status === "delivered" && (
                      <>
                        <button className="flex-1 border border-green-500 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                          Accept Delivery
                        </button>
                        <button className="flex-1 border border-orange-500 text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                          Request Revision
                        </button>
                      </>
                    )}
                    
                    {(order.status === "pending" || order.status === "active") && (
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
                        className="relative flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Open Chat
                      </button>
                    )}
                    
                    {order.status === "completed" && !order.isReviewed && (
                      <button className="flex-1 border border-blue-500 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchOrders(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === pagination.currentPage
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;