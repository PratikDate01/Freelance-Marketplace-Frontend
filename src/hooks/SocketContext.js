import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import config from '../config/environment';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(config.SOCKET_URL, {
        path: '/ws',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user's personal room
        newSocket.emit('join_user_room', user.id || user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Listen for typing events
      newSocket.on('user_typing', (data) => {
        // Handle typing indicator
        console.log('User typing:', data);
      });

      newSocket.on('user_stopped_typing', (data) => {
        // Handle stop typing
        console.log('User stopped typing:', data);
      });

      // Listen for new messages
      newSocket.on('new_message', (data) => {
        console.log('New message received:', data);
      });

      // Listen for order updates
      newSocket.on('order_status_update', (data) => {
        console.log('Order status update:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  const joinOrderRoom = (orderId) => {
    if (socket && connected) {
      console.log('🚪 Joining order room:', orderId);
      socket.emit('join_order', orderId);
    } else {
      console.log('❌ Cannot join order room - socket not connected');
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socket && connected) {
      console.log('🚪 Leaving order room:', orderId);
      socket.emit('leave_order', orderId);
    }
  };

  const joinConversationRoom = (conversationId) => {
    if (socket && connected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversationRoom = (conversationId) => {
    if (socket && connected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const startTyping = (conversationId, userName) => {
    if (socket && connected) {
      socket.emit('typing_start', {
        conversationId,
        userId: user.id || user._id,
        userName
      });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && connected) {
      socket.emit('typing_stop', {
        conversationId,
        userId: user.id || user._id
      });
    }
  };

  const value = {
    socket,
    connected,
    joinOrderRoom,
    leaveOrderRoom,
    joinConversationRoom,
    leaveConversationRoom,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;