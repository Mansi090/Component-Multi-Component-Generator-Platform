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

// ✅ API endpoints (without /api prefix for deployed backend)
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const signup = (data: { email: string; password: string; name: string }) =>
  api.post('/auth/signup', data);

export const generate = (prompt: string) =>
  api.post('/generate', { prompt });

export const fetchSessions = () =>
  api.get('/sessions');

export const createSession = (name: string) =>
  api.post('/sessions', { sessionName: name });
