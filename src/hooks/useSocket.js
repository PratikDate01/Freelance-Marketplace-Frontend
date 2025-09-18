import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import config from '../config/environment';

const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectSocket = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    // Build socket URL from env; default to backend URL
    const base = config.SOCKET_URL || config.API_URL || 'https://freelance-marketplace-backend-bppe.onrender.com';
    const socketURL = base.replace(/^http/, 'ws'); // http->ws, https->wss

    const token = localStorage.getItem('token') || undefined;

    // Initialize socket connection
    const newSocket = io(base, {
      path: '/ws',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        token, // server expects handshake.auth.token for JWT
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      // Join user's personal room
      newSocket.emit('join_user_room', user.id);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setTimeout(() => connectSocket(), 2000);
      }
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      setReconnectAttempts((prev) => prev + 1);
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (reconnectAttempts < 5) {
          connectSocket();
        }
      }, delay);
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    });

    newSocket.on('reconnect_failed', () => {
      setIsConnected(false);
    });

    // Listen for typing events
    newSocket.on('user_typing', (data) => {
      console.log('User typing:', data);
    });

    newSocket.on('user_stopped_typing', (data) => {
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
  }, [user, reconnectAttempts]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
        setReconnectAttempts(0);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      return;
    }

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, connectSocket]);

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const startTyping = (conversationId, userName) => {
    if (socket && isConnected) {
      socket.emit('typing_start', {
        conversationId,
        userId: user.id,
        userName,
      });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', {
        conversationId,
        userId: user.id,
      });
    }
  };

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };
};

export default useSocket;