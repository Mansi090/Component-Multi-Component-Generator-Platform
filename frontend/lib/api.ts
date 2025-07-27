import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Optional interceptor for handling 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      // You can add redirect logic here if needed
    }
    return Promise.reject(err);
  }
);

// ✅ Correct API calls aligned with backend routes
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
