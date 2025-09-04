import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getFeed: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/properties/feed?${params}`);
  },
  getReels: () => api.get('/properties/reels'),
  createProperty: (formData) => api.post('/properties', formData),
  getProperty: (id) => api.get(`/properties/${id}`),
  getUserProperties: (username) => api.get(`/properties/user/${username}`),
  likeProperty: (id) => api.post(`/properties/${id}/like`),
  getComments: (id) => api.get(`/properties/${id}/comments`),
  addComment: (id, content) => api.post(`/properties/${id}/comments`, { content })
};

// Property Requests API
export const propertyRequestsAPI = {
  createRequest: (requestData) => api.post('/property-requests', requestData),
  getUserRequests: () => api.get('/property-requests/my-requests'),
  getActiveRequests: (page = 1) => api.get('/property-requests/active', { params: { page } }),
  updateStatus: (requestId, status) => api.patch(`/property-requests/${requestId}/status`, { status }),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, page = 1) => api.get(`/messages/conversation/${userId}`, { params: { page } }),
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  sendPropertyInquiry: (propertyId, message) => api.post('/messages/property-inquiry', { property_id: propertyId, message }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Users API
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  searchUsers: (query) => api.get(`/users/search/${query}`),
};

export default api;
