import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // only needed if using cookies (can be removed if not)
});

// ✅ Attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional interceptor for handling 401 errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      // Optionally redirect to login or clear storage
    }
    return Promise.reject(err);
  }
);

// ✅ API calls
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const signup = (data: { email: string; password: string; name: string }) =>
  api.post('/auth/signup', data);

export const generate = (prompt: string) =>
  api.post('/api/generate', { prompt });

export const fetchSessions = () =>
  api.get('/api/sessions');

export const createSession = (name: string) =>
  api.post('/api/sessions', { sessionName: name });
