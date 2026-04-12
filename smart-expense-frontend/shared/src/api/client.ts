import axios from 'axios';

// Vite exposes env vars via import.meta.env (VITE_ prefix).
// Falls back to localhost:8080 for local development.
// In production, set VITE_API_URL= in your CI/CD or hosting platform.
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Sliding Session (New-Token header)
apiClient.interceptors.response.use(
  (response) => {
    const newToken = response.headers['new-token'];
    if (newToken && typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      console.log('Session extended with new token.');
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      if (status === 401) {
        // Token expired or invalid — clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // User authenticated but lacks the required role (e.g., ADMIN)
        // The UI layer (toast/notification system) should handle display;
        // we attach a friendly message so callers can read error.message
        console.warn('Access Denied: You do not have permission to perform this action.');
        return Promise.reject(
          Object.assign(error, { friendlyMessage: 'Access Denied. You do not have permission.' })
        );
      } else if (status !== undefined && status >= 500) {
        // Server-side error — log and surface a generic message
        console.error('Server error:', error.response?.data);
        return Promise.reject(
          Object.assign(error, { friendlyMessage: 'Service temporarily unavailable. Please try again later.' })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
