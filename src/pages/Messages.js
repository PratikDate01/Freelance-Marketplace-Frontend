import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useSocket } from '../hooks/SocketContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import PageHeader from '../components/PageHeader';
import { MessageCircle, Users, Clock } from 'lucide-react';
import axios from '../config/axios';

const Messages = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    if (!conversationId) return;

    // Fetch conversation by id and preselect
    (async () => {
      try {
        const { data } = await axios.get('/api/chat/conversations');
        const found = Array.isArray(data) ? data.find(c => c._id === conversationId) : null;
        if (found) {
          setSelectedConversation(found);
          setShowChat(true);
        }
      } catch (e) {
        console.error('Failed to preselect conversation', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (connected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [connected]);

  useEffect(() => {
    if (!socket) return;

    // Listen for online users updates
    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users));
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Messages"
        subtitle="Communicate with clients and freelancers"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-500' 
                : connectionStatus === 'disconnected'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}></div>
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
            {connectionStatus === 'connecting' && 'Connecting...'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="flex h-full">
            {/* Mobile: Show either list or chat */}
            <div className={`lg:flex ${showChat ? 'hidden' : 'flex'} lg:w-80`}>
              <ConversationList
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            </div>

            {/* Desktop: Always show chat, Mobile: Show when conversation selected */}
            <div className={`flex-1 ${showChat ? 'flex' : 'hidden lg:flex'}`}>
              <ChatWindow
                conversation={selectedConversation}
                onBack={handleBackToList}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;