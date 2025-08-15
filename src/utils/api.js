import axios from '../config/axios';

// API utility functions
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => axios.post('/api/auth/login', credentials),
    register: (userData) => axios.post('/api/auth/register', userData),
    logout: () => axios.post('/api/auth/logout'),
    me: () => axios.get('/api/auth/me'),
    googleAuth: () => axios.get('/api/auth/google'),
  },

  // User endpoints
  users: {
    getProfile: () => axios.get('/api/users/profile'),
    updateProfile: (data) => axios.put('/api/users/profile', data),
    getSettings: () => axios.get('/api/users/settings'),
    updatePassword: (data) => axios.put('/api/users/password', data),
    updateNotifications: (data) => axios.put('/api/users/notifications', data),
    getActivity: () => axios.get('/api/users/activity'),
  },

  // Gig endpoints
  gigs: {
    getAll: (params) => axios.get('/api/gigs', { params }),
    getById: (id) => axios.get(`/api/gigs/${id}`),
    create: (data) => axios.post('/api/gigs', data),
    update: (id, data) => axios.put(`/api/gigs/${id}`, data),
    delete: (id) => axios.delete(`/api/gigs/${id}`),
    getMyGigs: () => axios.get('/api/gigs/my-gigs'),
  },

  // Order endpoints
  orders: {
    create: (data) => axios.post('/api/orders', data),
    getById: (id) => axios.get(`/api/orders/${id}`),
    getBuyerOrders: (params) => axios.get('/api/orders/buyer', { params }),
    getSellerOrders: (params) => axios.get('/api/orders/seller', { params }),
    getBuyerStats: () => axios.get('/api/orders/buyer/stats'),
    getSellerStats: () => axios.get('/api/orders/seller/stats'),
    updateStatus: (id, status) => axios.put(`/api/orders/${id}/status`, { status }),
  },

  // Payment endpoints
  payments: {
    createPaymentIntent: (data) => axios.post('/api/payments/create-payment-intent', data),
    confirmPayment: (data) => axios.post('/api/payments/confirm-payment', data),
  },

  // Chat endpoints
  chat: {
    getConversations: () => axios.get('/api/chat/conversations'),
    getMessages: (conversationId) => axios.get(`/api/chat/conversations/${conversationId}/messages`),
    sendMessage: (conversationId, data) => axios.post(`/api/chat/conversations/${conversationId}/messages`, data),
    createConversation: (data) => axios.post('/api/chat/conversations', data),
  },

  // Review endpoints
  reviews: {
    create: (data) => axios.post('/api/reviews', data),
    getByGig: (gigId) => axios.get(`/api/reviews/gig/${gigId}`),
    getByUser: (userId) => axios.get(`/api/reviews/user/${userId}`),
  },

  // Notification endpoints
  notifications: {
    getAll: () => axios.get('/api/notifications'),
    markAsRead: (id) => axios.put(`/api/notifications/${id}/read`),
    markAllAsRead: () => axios.put('/api/notifications/mark-all-read'),
  },
};

export default axios;