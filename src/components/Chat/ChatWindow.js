import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { useSocket } from '../../hooks/SocketContext';
import axios from '../../config/axios';

const ChatWindow = ({ conversation, onBack, onClose }) => {
  const { user } = useAuth();
  const { socket, connected, joinConversationRoom, leaveConversationRoom, startTyping, stopTyping } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParticipant = conversation?.participants?.find(p => p._id !== user?.id);

  useEffect(() => {
    if (conversation?._id) {
      fetchMessages();
      markAsRead();
      
      // Join conversation room for real-time updates
      if (socket && connected) {
        joinConversationRoom(conversation._id);
      }
    }

    // Cleanup: leave conversation when component unmounts or conversation changes
    return () => {
      if (conversation?._id && socket) {
        leaveConversationRoom(conversation._id);
      }
    };
  }, [conversation?._id, socket, connected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (messageData) => {
      if (messageData.conversationId === conversation?._id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === messageData._id);
          if (exists) return prev;
          return [...prev, messageData];
        });
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, conversation?._id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat/conversations/${conversation._id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.patch(`/api/chat/conversations/${conversation._id}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Stop typing indicator
    stopTyping(conversation._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    const messageContent = newMessage;
    const tempId = `temp_${Date.now()}`;
    setNewMessage(''); // Clear input immediately for better UX

    // Add temporary message for immediate feedback
    const tempMessage = {
      _id: tempId,
      content: messageContent,
      sender: { _id: user.id, name: user.name },
      createdAt: new Date(),
      status: 'sending',
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await axios.post(`/api/chat/conversations/${conversation._id}/messages`, {
        content: messageContent,
        messageType: 'text'
      });

      // Remove temp message and let socket event add the real one
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update temp message to show error
      setMessages(prev => prev.map(msg => 
        msg._id === tempId 
          ? { ...msg, status: 'failed', content: messageContent }
          : msg
      ));
      
      // Restore message in input for retry
      setNewMessage(messageContent);
      
      // Show error notification
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.trim() && socket && connected) {
      startTyping(conversation._id, user?.name);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversation._id);
      }, 2000);
    } else if (!e.target.value.trim()) {
      stopTyping(conversation._id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload images, PDFs, or documents.');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversation._id);

      const uploadResponse = await axios.post('/api/chat/upload', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Send message with attachment
      const response = await axios.post(`/api/chat/conversations/${conversation._id}/messages`, {
        content: `Shared a file: ${file.name}`,
        messageType: file.type.startsWith('image/') ? 'image' : 'file',
        attachments: [{
          fileName: file.name,
          fileUrl: uploadResponse.data.fileUrl,
          fileType: file.type,
          fileSize: file.size
        }]
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
            {otherParticipant?.profilePicture || otherParticipant?.avatar ? (
              <img 
                src={otherParticipant.profilePicture || otherParticipant.avatar} 
                alt={otherParticipant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={otherParticipant?.profilePicture || otherParticipant?.avatar ? 'hidden' : 'flex'}>
              {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 capitalize">{otherParticipant?.role}</p>
              {connected && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.orderId && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Order Chat
            </span>
          )}
          {conversation.gigId && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Gig Inquiry
            </span>
          )}
          
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user?.id;
            const isSystem = message.messageType === 'system';
            
            if (isSystem) {
              return (
                <div key={message._id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm max-w-md text-center">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                        {message.sender.profilePicture || message.sender.avatar ? (
                          <img 
                            src={message.sender.profilePicture || message.sender.avatar} 
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={message.sender.profilePicture || message.sender.avatar ? 'hidden' : 'flex'}>
                          {message.sender.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{message.sender.name}</span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-lg ${
                    isOwn 
                      ? message.status === 'failed' 
                        ? 'bg-red-500 text-white' 
                        : message.status === 'sending' 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } ${message.isTemp ? 'opacity-70' : ''}`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Message status for own messages */}
                    {isOwn && (
                      <div className="flex items-center justify-end mt-1 gap-1">
                        <span className="text-xs opacity-75">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.status === 'sending' && (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {message.status === 'failed' && (
                          <span className="text-xs">❌ Failed</span>
                        )}
                        {!message.status && !message.isTemp && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                    )}
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index}>
                            {attachment.fileType?.startsWith('image/') ? (
                              <div className="max-w-xs">
                                <img 
                                  src={attachment.fileUrl} 
                                  alt={attachment.fileName}
                                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(attachment.fileUrl, '_blank')}
                                />
                                <p className="text-xs text-gray-500 mt-1">{attachment.fileName}</p>
                              </div>
                            ) : (
                              <a 
                                href={attachment.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded border ${
                                  isOwn ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                                } hover:bg-opacity-80 transition-colors`}
                              >
                                <Paperclip className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs text-gray-500">
                                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.createdAt)}
                    {message.isEdited && <span className="ml-1">(edited)</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">
                    {typingUsers[0].userName} is typing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            
            {/* Connection Status Indicator */}
            {!connected && (
              <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Reconnecting...
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;