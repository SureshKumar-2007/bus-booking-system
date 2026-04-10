const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Unable to complete request');
  }

  return payload;
};

export const api = {
  signup: (data) => request('/auth/signup', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  searchTrips: ({ from, to }) => request(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  getTrip: (id) => request(`/trips/${encodeURIComponent(id)}`),
  getSeats: (tripId) => request(`/seats/${encodeURIComponent(tripId)}`),
  createBooking: (data, token) => request('/bookings', { method: 'POST', body: data, token }),
  getBookings: (token) => request('/bookings', { token }),
  getBooking: (bookingId, token) => request(`/bookings/${encodeURIComponent(bookingId)}`, { token }),
  
  // Admin API Methods
  adminLogin: (data) => request('/admin/login', { method: 'POST', body: data }),
  getAdminDashboard: (token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request('/admin/dashboard', { token: adminToken });
  },
  getAdminUsers: ({ page = 1, search = '' }, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`, { token: adminToken });
  },
  getAdminTrips: ({ page = 1, search = '' }, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/trips?page=${page}&search=${encodeURIComponent(search)}`, { token: adminToken });
  },
  createAdminTrip: (data, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request('/admin/trips', { method: 'POST', body: data, token: adminToken });
  },
  updateAdminTrip: (tripId, data, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/trips/${encodeURIComponent(tripId)}`, { method: 'PUT', body: data, token: adminToken });
  },
  deleteAdminTrip: (tripId, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/trips/${encodeURIComponent(tripId)}`, { method: 'DELETE', token: adminToken });
  },
  getAdminBookings: ({ page = 1, search = '', status = '' }, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/bookings?page=${page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`, { token: adminToken });
  },
  updateAdminBookingStatus: (bookingId, data, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/bookings/${encodeURIComponent(bookingId)}/status`, { method: 'PUT', body: data, token: adminToken });
  },
  deleteAdminBooking: (bookingId, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/bookings/${encodeURIComponent(bookingId)}`, { method: 'DELETE', token: adminToken });
  },
  
  // Feature 1: Advanced Analytics
  getAdminAnalytics: (query, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/analytics?${query}`, { token: adminToken });
  },
  
  // Feature 2: Refund Management
  processAdminRefund: (bookingId, data, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/bookings/${encodeURIComponent(bookingId)}/refund`, { method: 'POST', body: data, token: adminToken });
  },
  getAdminRefunds: (query, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/refunds?${query}`, { token: adminToken });
  },
  updateAdminRefundStatus: (refundId, status, notes, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/refunds/${encodeURIComponent(refundId)}/status`, { 
      method: 'PUT', 
      body: { status, notes }, 
      token: adminToken 
    });
  },
  
  // Feature 4: Admin Activity Logs
  getAdminActivityLogs: (query, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/activity-logs?${query}`, { token: adminToken });
  },
  
  // Feature 5: Announcements
  createAdminAnnouncement: (data, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request('/admin/announcements', { method: 'POST', body: data, token: adminToken });
  },
  getAdminAnnouncements: (query, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/announcements?${query}`, { token: adminToken });
  },
  deleteAdminAnnouncement: (announcementId, token) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return request(`/admin/announcements/${encodeURIComponent(announcementId)}`, { method: 'DELETE', token: adminToken });
  }
};

// Backward compatibility - also export individual functions
export const signup = (data) => api.signup(data);
export const login = (data) => api.login(data);
export const searchTrips = ({ from, to }) => api.searchTrips({ from, to });
export const getTrip = (id) => api.getTrip(id);
export const getSeats = (tripId) => api.getSeats(tripId);
export const createBooking = (data, token) => api.createBooking(data, token);
export const getBookings = (token) => api.getBookings(token);
export const getBooking = (bookingId, token) => api.getBooking(bookingId, token);

export default api;

