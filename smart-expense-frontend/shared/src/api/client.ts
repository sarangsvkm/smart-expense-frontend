import axios from 'axios';
import { clearSession, getStoredToken, storeToken, onUnauthorizedCallback } from './session';

// Mobile API URL - can be overridden at startup
let _mobileApiUrl = 'http://10.0.2.2:8080/api';

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return _mobileApiUrl;
};

// Must be declared BEFORE setApiBaseUrl so the reference is valid
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const setApiBaseUrl = (url: string) => {
  _mobileApiUrl = url;
  apiClient.defaults.baseURL = url;
  console.log('[API] Base URL set to:', url);
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const newToken = response.headers['new-token'];
    if (newToken) storeToken(newToken);
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      return Promise.reject(
        Object.assign(error, { friendlyMessage: 'Access Denied.' })
      );
    } else if (status !== undefined && status >= 500) {
      return Promise.reject(
        Object.assign(error, { friendlyMessage: 'Service unavailable. Try again later.' })
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
