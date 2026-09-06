import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken } = res.data.data;
          localStorage.setItem(TOKEN_KEY, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
