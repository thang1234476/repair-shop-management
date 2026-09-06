import api from './axiosInstance';
export const dashboardApi = {
  getSummary: () => api.get('/admin/dashboard/summary'),
  getRevenue: (params) => api.get('/admin/dashboard/revenue', { params }),
  getInventoryAlerts: () => api.get('/admin/dashboard/inventory-alerts'),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
};
