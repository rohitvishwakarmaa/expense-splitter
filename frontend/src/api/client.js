import axios from 'axios';

// Use local URL in development, but fallback to relative URL or a Render placeholder in production
const isProd = import.meta.env.PROD;
const BASE_URL = import.meta.env.VITE_API_URL || (isProd ? 'https://your-production-backend.onrender.com/api' : 'http://localhost:8000/api');

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for unified error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default client;
