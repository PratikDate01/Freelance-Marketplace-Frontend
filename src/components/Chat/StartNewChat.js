import React, { useState, useEffect } from 'react';
import { Search, User, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import axios from '../../config/axios';

const StartNewChat = ({ onConversationCreated, onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    fetchRecentClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchRecentClients = async () => {
    try {
      // Fetch recent orders to get clients the freelancer has worked with
      const response = await axios.get('/api/orders', {
        params: { limit: 10 }
      });
      
      const clients = response.data
        .filter(order => order.buyerId && order.buyerId._id !== user.id)
        .map(order => order.buyerId)
        .filter((client, index, self) => 
          index === self.findIndex(c => c._id === client._id)
        )
        .slice(0, 5);
      
      setRecentClients(clients);
    } catch (error) {
      console.error('Error fetching recent clients:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/search', {
        params: { 
          query: searchQuery,
          role: user.role === 'freelancer' ? 'client' : 'freelancer',
          limit: 10
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (participantId) => {
    try {
      const response = await axios.post('/api/chat/conversations/direct', {
        participantId
      });
      
      onConversationCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const UserItem = ({ userData, showStartChat = true }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {userData.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{userData.name}</h4>
          <p className="text-sm text-gray-500 capitalize">{userData.role}</p>
          {userData.email && (
            <p className="text-xs text-gray-400">{userData.email}</p>
          )}
        </div>
      </div>
      {showStartChat && (
        <button
          onClick={() => startConversation(userData._id)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Start New Chat</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${user.role === 'freelancer' ? 'clients' : 'freelancers'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((userData) => (
                    <UserItem key={userData._id} userData={userData} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          )}

          {/* Recent Clients/Freelancers */}
          {!searchQuery.trim() && recentClients.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Recent {user.role === 'freelancer' ? 'Clients' : 'Freelancers'}
              </h3>
              <div className="space-y-2">
                {recentClients.map((userData) => (
                  <UserItem key={userData._id} userData={userData} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!searchQuery.trim() && recentClients.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your First Chat</h3>
              <p className="text-gray-500">
                Search for {user.role === 'freelancer' ? 'clients' : 'freelancers'} to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartNewChat;