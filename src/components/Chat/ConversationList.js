import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Clock, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { useSocket } from '../../hooks/SocketContext';
import StartNewChat from './StartNewChat';
import axios from '../../config/axios';

const ConversationList = ({ selectedConversation, onSelectConversation }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [showStartNewChat, setShowStartNewChat] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for conversation updates
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = () => {
      fetchConversations();
    };

    socket.on('conversation_updated', handleConversationUpdate);
    
    return () => {
      socket.off('conversation_updated', handleConversationUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv => 
        conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationTitle = (conversation) => {
    if (conversation.orderId) {
      return `Order: ${conversation.orderId.gigTitle}`;
    }
    if (conversation.gigId) {
      return `Inquiry: ${conversation.gigId.title}`;
    }
    return conversation.otherParticipant?.name || 'Unknown User';
  };

  const handleNewConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev]);
    onSelectConversation(conversation);
    setShowStartNewChat(false);
  };

  const getStatusIcon = (conversation) => {
    if (conversation.orderId) {
      const status = conversation.orderId.status;
      switch (status) {
        case 'active':
          return <Clock className="w-4 h-4 text-blue-500" />;
        case 'completed':
          return <CheckCircle className="w-4 h-4 text-green-500" />;
        default:
          return <MessageCircle className="w-4 h-4 text-gray-400" />;
      }
    }
    return <MessageCircle className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowStartNewChat(true)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
            title="Start new chat"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-400 mt-1">
                Start by browsing gigs or placing an order
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?._id === conversation._id ? 'bg-green-50 border-r-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {conversation.otherParticipant?.profilePicture || conversation.otherParticipant?.avatar ? (
                        <img 
                          src={conversation.otherParticipant.profilePicture || conversation.otherParticipant.avatar} 
                          alt={conversation.otherParticipant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={conversation.otherParticipant?.profilePicture || conversation.otherParticipant?.avatar ? 'hidden' : 'flex'}>
                        {conversation.otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.otherParticipant?.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(conversation)}
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(conversation.lastMessage?.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Conversation type */}
                    {(conversation.orderId || conversation.gigId) && (
                      <p className="text-xs text-blue-600 mb-1 truncate">
                        {getConversationTitle(conversation)}
                      </p>
                    )}

                    {/* Last message */}
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}>
                      {conversation.lastMessage?.messageType === 'system' && '🔔 '}
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>

                    {/* Order status */}
                    {conversation.orderId && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conversation.orderId.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          conversation.orderId.status === 'completed' ? 'bg-green-100 text-green-800' :
                          conversation.orderId.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.orderId.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${conversation.orderId.totalAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start New Chat Modal */}
      {showStartNewChat && (
        <StartNewChat
          onConversationCreated={handleNewConversation}
          onClose={() => setShowStartNewChat(false)}
        />
      )}
    </div>
  );
};

export default ConversationList;