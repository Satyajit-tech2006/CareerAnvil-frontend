import axios from 'axios';
import { ENDPOINTS } from './endpoints.js';

const apiClient = axios.create({
  // Ensure VITE_API_URL is set in your .env file (e.g., http://localhost:8000/api/v1)
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // Crucial for sending cookies (refreshToken)
});

// We no longer rely solely on this variable; we check localStorage too.
let accessToken = localStorage.getItem('accessToken') || '';

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
    // Explicitly set the default header for immediate use
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Clear everything if token is explicitly removed (logout)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    // 1. Check in-memory variable
    // 2. Fallback to localStorage (Fixes "Logout on Reload" issue)
    const token = accessToken || localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401) {
      // Prevent infinite loops
      if (originalRequest._retry || originalRequest.url.includes("refresh-token")) {
        // If refresh fails, clear storage and redirect
        setAccessToken(''); // This clears localStorage too
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to get a new access token
        const response = await apiClient.post(ENDPOINTS.USERS.REFRESH_TOKEN);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update local state, storage, and the header for the retry
        setAccessToken(newAccessToken);
        
        // Optional: If your backend sends a new Refresh Token in the body, update it too
        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        setAccessToken('');
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;