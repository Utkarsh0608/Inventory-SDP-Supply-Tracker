import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: '/api', // Proxied to http://127.0.0.1:8000 via vite.config.js
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
