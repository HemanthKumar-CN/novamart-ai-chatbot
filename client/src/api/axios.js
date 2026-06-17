import axios from 'axios';

/**
 * Axios instance — uses /api prefix in dev (proxied to server) and
 * the same prefix in prod (proxied by nginx in Docker, or set
 * VITE_API_URL to the deployed backend for split deployments).
 *
 * Auth strategy: DUAL MODE
 *   1. Server sets an httpOnly cookie on login/signup (XSS-safe)
 *   2. Client also stores the token in localStorage as a fallback
 *   3. Server reads from cookie FIRST, falls back to Authorization header
 *   → This means a CSRF/XSS attack can only compromise one method.
 */
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  // withCredentials lets the browser send the httpOnly cookie cross-origin
  withCredentials: true,
  timeout: 60000,
});

// Attach Bearer token as fallback if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('novamart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling — only redirect if we're on a protected route
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      localStorage.removeItem('novamart_token');
      localStorage.removeItem('novamart_user');
      // Don't loop — only redirect if we're inside the app
      if (path === '/chat' || path.startsWith('/chat')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
