import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Remove if you're not using cookies
});

// ✅ Attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔐 Handle unauthorized errors globally (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      // Optional: redirect to login or clear token
    }
    return Promise.reject(err);
  }
);

// ✅ API calls (routes now match your backend)
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const signup = (data: { email: string; password: string; name: string }) =>
  api.post('/auth/signup', data);

export const generate = (prompt: string) =>
  api.post('/generate', { prompt }); // ✅ Removed /api

export const fetchSessions = () =>
  api.get('/sessions'); // ✅ Removed /api

export const createSession = (name: string) =>
  api.post('/sessions', { sessionName: name }); // ✅ Removed /api
