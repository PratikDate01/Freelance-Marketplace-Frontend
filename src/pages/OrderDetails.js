import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { useSocket } from '../hooks/SocketContext';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Download,
  Upload,
  Star,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { formatPrice } from '../utils/currency';
import axios from 'axios';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    note: '',
    files: []
  });
  const [revisionNote, setRevisionNote] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Socket.IO setup for real-time messaging
  useEffect(() => {
    if (socket && id) {
      // Join the order room
      joinOrderRoom(id);

      // Listen for new messages
      const handleNewMessage = (data) => {
        console.log('🔔 Received new message:', data);
        if (data.orderId === id) {
          console.log('✅ Message is for current order, updating state');
          setOrder(prevOrder => ({
            ...prevOrder,
            messages: [...(prevOrder.messages || []), data.message]
          }));
          
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          console.log('❌ Message is for different order:', data.orderId, 'vs', id);
        }
      };

      socket.on('new_order_message', handleNewMessage);

      // Listen for typing indicators
      const handleUserTyping = (data) => {
        if (data.userId !== user.id && data.userId !== user._id) {
          setOtherUserTyping(true);
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.userId !== user.id && data.userId !== user._id) {
          setOtherUserTyping(false);
        }
      };

      socket.on('order_user_typing', handleUserTyping);
      socket.on('order_user_stopped_typing', handleUserStoppedTyping);

      // Cleanup
      return () => {
        socket.off('new_order_message', handleNewMessage);
        socket.off('order_user_typing', handleUserTyping);
        socket.off('order_user_stopped_typing', handleUserStoppedTyping);
        leaveOrderRoom(id);
      };
    }
  }, [socket, id, joinOrderRoom, leaveOrderRoom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.messages]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate(user?.role === 'client' ? '/client/orders' : '/freelancer/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async () => {
    try {
      console.log('🚀 Starting delivery process:', {
        orderId: id,
        noteLength: deliveryData.note.length,
        filesCount: deliveryData.files.length,
        files: deliveryData.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      if (!deliveryData.note.trim()) {
        alert('Please provide a delivery note.');
        return;
      }

      const formData = new FormData();
      formData.append('deliveryNote', deliveryData.note);
      
      // Add files to form data
      deliveryData.files.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        formData.append('deliveryFiles', file);
      });

      // Log form data contents
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }

      const response = await axios.post(`/api/delivery/orders/${id}/deliver`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Delivery successful:', response.data);

      setShowDeliveryModal(false);
      setDeliveryData({ note: '', files: [] });
      fetchOrderDetails();
      alert('Order delivered successfully!');
    } catch (error) {
      console.error('❌ Error delivering order:', error);
      
      let errorMessage = 'Failed to deliver order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 413) {
        errorMessage = 'Files are too large. Please reduce file sizes and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your files and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      await axios.post(`/api/delivery/orders/${id}/accept`, reviewData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowReviewModal(false);
      fetchOrderDetails();
      alert('Order completed successfully!');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (socket && value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('order_typing_start', {
        orderId: id,
        userId: user.id || user._id,
        userName: user.name
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        setIsTyping(false);
        socket.emit('order_typing_stop', {
          orderId: id,
          userId: user.id || user._id
        });
      }
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('📤 Sending message:', newMessage, 'to order:', id);

    // Stop typing indicator
    if (socket && isTyping) {
      setIsTyping(false);
      socket.emit('order_typing_stop', {
        orderId: id,
        userId: user.id || user._id
      });
    }

    setSendingMessage(true);
    try {
      const response = await axios.post(`/api/orders/${id}/messages`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Message sent successfully:', response.data);
      setNewMessage('');
      // No need to refresh - Socket.IO will handle real-time updates
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRequestRevision = async () => {
    try {
      await axios.post(`/api/delivery/orders/${id}/revision`, {
        revisionNote
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowRevisionModal(false);
      setRevisionNote('');
      fetchOrderDetails();
      alert('Revision requested successfully!');
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Failed to request revision. Please try again.');
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const getDaysRemaining = (deliveryDate) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

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
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(order.deliveryDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`Order #${order._id.slice(-8)}`}
        subtitle={order.gigTitle}
        backButtonProps={{
          to: isClient ? '/client/orders' : '/freelancer/orders',
          label: 'Back to Orders'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {order.statusHistory?.map((status, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      index === 0 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{status.status}</p>
                      <p className="text-sm text-gray-600">{status.note}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Timeline */}
              {order.status === 'active' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">Delivery Timeline</span>
                    <span className={`font-medium ${
                      daysRemaining < 0 ? 'text-red-600' :
                      daysRemaining <= 1 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {daysRemaining < 0 
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : daysRemaining === 0 
                          ? 'Due today'
                          : `${daysRemaining} days remaining`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Due: {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Requirements */}
            {order.requirements && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{order.requirements}</p>
                </div>
              </div>
            )}

            {/* Delivery */}
            {(order.deliveryNote || (order.deliveryFiles && order.deliveryFiles.length > 0)) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery</h3>
                
                {order.deliveryNote && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{order.deliveryNote}</p>
                  </div>
                )}

                {/* Delivery Files */}
                {order.deliveryFiles && order.deliveryFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Delivery Files ({order.deliveryFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {order.deliveryFiles.map((file, index) => {
                        console.log('📁 Rendering delivery file:', file);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {file.fileName || `File ${index + 1}`}
                              </p>
                              {file.fileSize && (
                                <p className="text-sm text-gray-500">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                              {file.fileType && (
                                <p className="text-xs text-gray-400">
                                  {file.fileType}
                                </p>
                              )}
                            </div>
                            {file.fileUrl && (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <strong>Debug Info:</strong>
                    <pre>{JSON.stringify({
                      hasDeliveryNote: !!order.deliveryNote,
                      deliveryFilesCount: order.deliveryFiles?.length || 0,
                      deliveryFiles: order.deliveryFiles
                    }, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
              
              {/* Messages List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {order.messages && order.messages.length > 0 ? (
                  order.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.sender._id === user.id || message.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === user.id || message.sender._id === user._id
                          ? 'bg-green-500 text-white'
                          : message.isSystem
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender._id === user.id || message.sender._id === user._id
                            ? 'text-green-100'
                            : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No messages yet</p>
                )}
                {/* Typing Indicator */}
                {otherUserTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">

                {/* Freelancer Actions */}
                {isFreelancer && order.status === 'active' && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Upload className="w-4 h-4" />
                    Deliver Order
                  </button>
                )}

                {/* Client Actions */}
                {isClient && order.status === 'delivered' && (
                  <>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Delivery
                    </button>
                    
                    {order.revisionCount < order.maxRevisions && (
                      <button
                        onClick={() => setShowRevisionModal(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Request Revision ({order.revisionCount}/{order.maxRevisions})
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service price</span>
                  <span className="font-medium">{formatPrice(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">{formatPrice(order.serviceFee)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Order placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Payment: {order.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Participant Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isClient ? 'Seller' : 'Client'} Information
              </h3>
              
              {(() => {
                const participant = isClient ? order.sellerId : order.buyerId;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant?.name}</p>
                      <p className="text-sm text-gray-600">{participant?.email}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliver Order</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Note *
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
                onChange={(e) => setDeliveryData({...deliveryData, files: Array.from(e.target.files)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your completed work files (Max 5 files, 10MB each)
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
                onClick={handleDeliverOrder}
                disabled={!deliveryData.note.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deliver Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Revision</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What needs to be revised? *
              </label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Please be specific about what changes you need..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={!revisionNote.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Order</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate this service
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`p-1 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a review (Optional)
              </label>
              <textarea
                value={reviewData.review}
                onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                placeholder="Share your experience with this service..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptDelivery}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;