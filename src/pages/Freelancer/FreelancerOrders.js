import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Upload,
  Download,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { formatPrice } from '../../utils/currency';
import axios from '../../config/axios';

const FreelancerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    note: '',
    files: []
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/seller', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Handle different response structures
      const ordersData = response.data.orders || response.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    // Ensure orders is always an array
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.gigTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'revision':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'delivered':
        return <Upload className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      case 'revision':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleDeliverOrder = async (orderId) => {
    try {
      const response = await axios.post(`/api/orders/${orderId}/deliver`, deliveryData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'delivered' } : order
      ));
      
      setShowDeliveryModal(false);
      setDeliveryData({ note: '', files: [] });
      alert('Order delivered successfully!');
    } catch (error) {
      console.error('Error delivering order:', error);
      alert('Failed to deliver order. Please try again.');
    }
  };

  const getDaysRemaining = (deliveryDate) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining < 0) return 'text-red-600';
    if (daysRemaining <= 1) return 'text-orange-600';
    if (daysRemaining <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Orders"
        subtitle="Manage and track your client orders"
        backButtonProps={{
          to: '/freelancer/dashboard',
          label: 'Back to Dashboard'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="revision">Revision</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'Orders from clients will appear here'
                  : `You don't have any ${statusFilter} orders at the moment`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const daysRemaining = getDaysRemaining(order.deliveryDate);
                
                return (
                  <div key={order._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Order Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900">{order.gigTitle}</h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-medium">#{order._id.slice(-8)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-medium text-green-600">{formatPrice(order.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Delivery Timeline */}
                        {order.status === 'active' && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-900">
                                Delivery Timeline
                              </span>
                              <span className={`text-sm font-medium ${getUrgencyColor(daysRemaining)}`}>
                                {daysRemaining < 0 
                                  ? `${Math.abs(daysRemaining)} days overdue`
                                  : daysRemaining === 0 
                                    ? 'Due today'
                                    : `${daysRemaining} days remaining`
                                }
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-blue-700">
                              Due: {new Date(order.deliveryDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {/* Requirements */}
                        {order.requirements && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Requirements:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {order.requirements}
                            </p>
                          </div>
                        )}

                        {/* Delivery Note (if delivered) */}
                        {order.deliveryNote && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Delivery Note:</p>
                            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                              {order.deliveryNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {/* Message Button */}
                        <Link
                          to={`/freelancer/orders/${order._id}`}
                          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                          title="View Messages"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {order.messages && order.messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {order.messages.length > 9 ? '9+' : order.messages.length}
                            </span>
                          )}
                        </Link>

                        {/* View Details */}
                        <Link
                          to={`/freelancer/orders/${order._id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>

                        {/* Deliver Order Button */}
                        {order.status === 'active' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeliveryModal(true);
                            }}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Deliver Order
                          </button>
                        )}

                        {/* Download Files */}
                        {order.deliveryFiles && order.deliveryFiles.length > 0 && (
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deliver Order
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Note
              </label>
              <textarea
                value={deliveryData.note}
                onChange={(e) => setDeliveryData({...deliveryData, note: e.target.value})}
                placeholder="Describe what you've delivered..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="4"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Files (Optional)
              </label>
              <input
                type="file"
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  // TODO: Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your completed work files
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeliverOrder(selectedOrder._id)}
                disabled={!deliveryData.note.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deliver Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerOrders;