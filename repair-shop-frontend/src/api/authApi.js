import api from './axiosInstance';
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};
