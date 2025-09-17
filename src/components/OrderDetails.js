import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import useSocket from '../hooks/useSocket';
import PaymentStatus from './PaymentStatus';
import ChatWindow from './Chat/ChatWindow';
import { 
  MessageCircle, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import axios from '../config/axios';

const OrderDetails = ({ orderId, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchOrCreateConversation();
    }
  }, [orderId]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for order updates
    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => ({
          ...prev,
          status: data.status,
          paymentStatus: data.paymentStatus,
          updatedAt: data.timestamp
        }));
      }
    };

    socket.on('order_updated', handleOrderUpdate);
    return () => socket.off('order_updated', handleOrderUpdate);
  }, [socket, user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrCreateConversation = async () => {
    try {
      const response = await axios.post('/api/chat/conversations', {
        orderId: orderId,
        type: 'order'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const handleDeliverOrder = async () => {
    try {
      await axios.patch(`/api/orders/${orderId}/deliver`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setOrder(prev => ({ ...prev, status: 'delivered' }));
      alert('Order marked as delivered!');
    } catch (error) {
      console.error('Error delivering order:', error);
      alert('Failed to deliver order. Please try again.');
    }
  };

  const handleAcceptOrder = async () => {
    try {
      await axios.patch(`/api/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setOrder(prev => ({ ...prev, status: 'completed' }));
      alert('Order accepted! Payment will be released to the freelancer.');
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'active':
        return 'In Progress';
      case 'delivered':
        return 'Delivered';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="font-medium">{getStatusText(order.status)}</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'payment'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Chat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(90vh - 200px)' }}>
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gig Title</label>
                    <p className="text-gray-900">{order.gigId?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-gray-900 font-semibold">${order.totalAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Time</label>
                    <p className="text-gray-900">{order.deliveryTime} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {order.buyerId?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-medium">{order.buyerId?.name || 'Client'}</p>
                      <p className="text-sm text-gray-500">Client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {order.sellerId?.name?.charAt(0)?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <p className="font-medium">{order.sellerId?.name || 'Freelancer'}</p>
                      <p className="text-sm text-gray-500">Freelancer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {order.requirements && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.requirements}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {user?.role === 'freelancer' && order.status === 'active' && (
                  <button
                    onClick={handleDeliverOrder}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Mark as Delivered
                  </button>
                )}
                {user?.role === 'client' && order.status === 'delivered' && (
                  <button
                    onClick={handleAcceptOrder}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Accept & Release Payment
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="p-6">
              <PaymentStatus 
                orderId={orderId} 
                onStatusChange={(status) => {
                  setOrder(prev => ({ ...prev, paymentStatus: status }));
                }}
              />
            </div>
          )}

          {activeTab === 'chat' && conversation && (
            <div className="h-full">
              <ChatWindow 
                conversation={conversation}
                onBack={() => setActiveTab('details')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;