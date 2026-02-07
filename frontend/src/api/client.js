import axios from 'axios';
import { getToken, clearAuthStorage } from '@/utils/storage.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:21090/api/vital-track/v1.0';

const client = axios.create({
  baseURL,
  timeout: 30000,
});

client.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
