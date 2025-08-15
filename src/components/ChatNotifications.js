import React, { useState, useEffect } from 'react';
import { MessageCircle, X, User } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import useSocket from '../hooks/useSocket';

const ChatNotifications = ({ onOpenChat }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for message notifications
    const handleMessageNotification = (data) => {
      // Don't show notification for own messages
      if (data.senderId === user.id) return;

      const notification = {
        id: `${data.conversationId}_${Date.now()}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        timestamp: data.timestamp,
        unreadCount: data.unreadCount,
        isRead: false
      };

      setNotifications(prev => {
        // Remove existing notification from same conversation
        const filtered = prev.filter(n => n.conversationId !== data.conversationId);
        return [notification, ...filtered];
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${data.senderName}`, {
          body: data.content.length > 50 ? data.content.substring(0, 50) + '...' : data.content,
          icon: '/logo192.png',
          tag: data.conversationId // This will replace previous notifications from same conversation
        });
      }

      // Show toast notification
      showToastNotification(notification);
    };

    // Listen for conversation updates
    const handleConversationUpdated = (data) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.conversationId === data.conversationId
            ? { ...notif, unreadCount: data.unreadCount }
            : notif
        )
      );
    };

    socket.on('message_notification', handleMessageNotification);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('message_notification', handleMessageNotification);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, user]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showToastNotification = (notification) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm cursor-pointer hover:bg-blue-600 transition-colors';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold">${notification.senderName}</h4>
          <p class="text-sm opacity-90">${notification.content.length > 60 ? notification.content.substring(0, 60) + '...' : notification.content}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    // Click to open chat
    toast.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'svg' && e.target.tagName !== 'path') {
        onOpenChat && onOpenChat(notification.conversationId);
        toast.remove();
      }
    });
    
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
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const openChat = (conversationId) => {
    onOpenChat && onOpenChat(conversationId);
    setShowNotifications(false);
    // Mark notification as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.conversationId === conversationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Message Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Messages</h3>
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
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No new messages</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => openChat(notification.conversationId)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {notification.senderName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.senderName}
                        </h4>
                        <div className="flex items-center gap-2">
                          {notification.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {notification.unreadCount}
                            </span>
                          )}
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
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {notification.content}
                      </p>
                      
                      <span className="text-xs text-gray-500 mt-1 block">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  }}
                  className="flex-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => {
                    setNotifications([]);
                    setShowNotifications(false);
                  }}
                  className="flex-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatNotifications;