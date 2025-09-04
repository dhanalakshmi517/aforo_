import axios from 'axios';
import { getAuthHeaders, logout } from '../../utils/auth';

// Attach auth headers & handle 401 globally
axios.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  } as any;
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  },
);

export default axios; // export patched instance
