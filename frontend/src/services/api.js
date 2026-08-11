import axios from 'axios';

// API Gateway base URL - update with actual deployed URL
const API_BASE = process.env.REACT_APP_API_GATEWAY_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Bypass-Tunnel-Remainder'] = 'true';
  config.headers['ngrok-skip-browser-warning'] = 'true';
  config.headers['localtunnel-bypass-api-key'] = 'true';
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_token');
      localStorage.removeItem('sc_uid');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Auth Service (Membre 1) ---
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

// --- Session Service (Membre 2) ---
export const sessionService = {
  getSessions: (filters) => api.get('/sessions', { params: filters }),
  getSession: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
  joinSession: (id) => {                                          // ✅ Fix Bug 3: send userId in body
    const userId = localStorage.getItem('sc_uid');
    return api.post(`/sessions/${id}/join`, { userId });
  },
  leaveSession: (id) => api.post(`/sessions/${id}/leave`),
  cancelSession: (id, userId) => api.post(`/sessions/${id}/cancel`, { userId }),
  deleteSession: (id, userId) => api.delete(`/sessions/${id}`, { data: { userId } }),
};

// --- Matchmaking & Performance Service (Membre 3) ---
export const matchService = {
  findPartners: (filters) => api.get('/matchmaking/partners', { params: filters }),
  getMatches: () => api.get('/matchmaking/matches'),
  acceptMatch: (id) => api.post(`/matchmaking/matches/${id}/accept`),
  rejectMatch: (id) => api.post(`/matchmaking/matches/${id}/reject`),
};

export const performanceService = {
  getStats: (userId) => api.get(`/performances/stats/${userId || localStorage.getItem('sc_uid')}`),
  logActivity: (data) => {
    const userId = localStorage.getItem('sc_uid');
    return api.post('/performances', { ...data, userId });
  },
  getActivities: (userId) => api.get(`/performances/${userId || localStorage.getItem('sc_uid')}`),
};

export default api;
