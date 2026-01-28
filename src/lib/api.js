import axios from 'axios';
import { ENDPOINTS } from './endpoints.js';

const apiClient = axios.create({
  // Ensure VITE_API_URL is set in your .env file (e.g., http://localhost:8000/api/v1)
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // Crucial for sending cookies (refreshToken)
});

let accessToken = '';

export const setAccessToken = (token) => {
  accessToken = token;
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
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
        // If refresh fails, redirect to login
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to get a new access token
        const response = await apiClient.post(ENDPOINTS.USERS.REFRESH_TOKEN);
        const { accessToken: newAccessToken } = response.data.data;

        // Update local state and the header for the retry
        setAccessToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;