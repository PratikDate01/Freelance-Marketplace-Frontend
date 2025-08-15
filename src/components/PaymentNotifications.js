import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import useSocket from '../hooks/useSocket';
import axios from 'axios';

const PaymentNotifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for real-time payment notifications
    const handlePaymentReceived = (data) => {
      if (user.role === 'freelancer') {
        const notification = {
          id: data.orderId,
          type: 'payment_received',
          title: 'Payment Received! 💰',
          message: `You received $${data.netAmount} for "${data.gigTitle}"`,
          amount: data.netAmount,
          gigTitle: data.gigTitle,
          paymentStatus: data.paymentStatus,
          timestamp: data.timestamp,
          isRead: false,
          isNew: true
        };
        
        setNotifications(prev => [notification, ...prev]);
        showToastNotification(notification);
      }
    };

    const handlePaymentConfirmed = (data) => {
      if (user.role === 'client') {
        const notification = {
          id: data.orderId,
          type: 'payment_confirmed',
          title: 'Payment Confirmed ✅',
          message: `Payment of $${data.amount} confirmed for "${data.gigTitle}"`,
          amount: data.amount,
          gigTitle: data.gigTitle,
          paymentStatus: data.paymentStatus,
          timestamp: data.timestamp,
          isRead: false,
          isNew: true
        };
        
        setNotifications(prev => [notification, ...prev]);
        showToastNotification(notification);
      }
    };

    const handlePaymentReleased = (data) => {
      if (user.role === 'freelancer') {
        const notification = {
          id: data.orderId,
          type: 'payment_released',
          title: 'Payment Released! 🎉',
          message: `$${data.amount} has been released to your account for "${data.gigTitle}"`,
          amount: data.amount,
          gigTitle: data.gigTitle,
          paymentStatus: 'released',
          timestamp: data.timestamp,
          isRead: false,
          isNew: true
        };
        
        setNotifications(prev => [notification, ...prev]);
        showToastNotification(notification);
      }
    };

    socket.on('payment_received', handlePaymentReceived);
    socket.on('payment_confirmed', handlePaymentConfirmed);
    socket.on('payment_released', handlePaymentReleased);

    return () => {
      socket.off('payment_received', handlePaymentReceived);
      socket.off('payment_confirmed', handlePaymentConfirmed);
      socket.off('payment_released', handlePaymentReleased);
    };
  }, [socket, user]);

  const fetchPaymentNotifications = async () => {
    try {
      const response = await axios.get('/api/payments/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching payment notifications:', error);
    }
  };

  const showToastNotification = (notification) => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold">${notification.title}</h4>
          <p class="text-sm opacity-90">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true, isNew: false }
          : notif
      )
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'payment_confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'payment_released':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <DollarSign className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Payment Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No payment notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.isNew ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        
                        {notification.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            ${notification.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => {
                  setNotifications([]);
                  setShowNotifications(false);
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentNotifications;