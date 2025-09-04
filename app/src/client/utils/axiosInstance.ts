import axios from 'axios';
import { getAuthHeaders, logout } from './auth';

// Request interceptor adds auth headers
axios.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  } as any;
  return config;
});

// Response interceptor handles 401
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      logout();
    }
    return Promise.reject(err);
  },
);

export default axios;
