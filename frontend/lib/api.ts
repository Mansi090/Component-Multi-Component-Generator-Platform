import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', // ✅ Keep this unchanged
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized');
    }
    return Promise.reject(err);
  }
);

// ✅ API endpoints (with /api prefix for deployed backend)
export const login = (data: { email: string; password: string }) =>
  api.post('/api/auth/login', data);

export const signup = (data: { email: string; password: string; name: string }) =>
  api.post('/api/auth/signup', data);

export const generate = (prompt: string) =>
  api.post('/api/generate', { prompt });

export const fetchSessions = () =>
  api.get('/api/sessions');

export const createSession = (name: string) =>
  api.post('/api/sessions', { sessionName: name });

export const getSession = (id: string) =>
  api.get(`/api/sessions/${id}`);

export const updateSession = (id: string, data: { chatHistory: any[]; jsxCode: string; cssCode: string }) =>
  api.put(`/api/sessions/${id}`, data);
