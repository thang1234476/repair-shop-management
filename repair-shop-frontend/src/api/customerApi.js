import api from './axiosInstance';
export const customerApi = {
  updateProfile: (data) => api.put('/customer/profile', data),
  getMyDevices: () => api.get('/customer/devices'),
  getMyDevice: (id) => api.get(`/customer/devices/${id}`),
  addDevice: (data) => api.post('/customer/devices', data),
  updateDevice: (id, data) => api.put(`/customer/devices/${id}`, data),
  getDeviceHistory: (id) => api.get(`/customer/devices/${id}/history`),
  getNotifications: (params) => api.get('/customer/notifications', { params }),
  markNotificationRead: (id) => api.put(`/customer/notifications/${id}/read`),
  // Staff/Admin
  getCustomers: (params) => api.get('/staff/customers', { params }),
  createCustomer: (data) => api.post('/staff/customers', data),
  updateCustomer: (id, data) => api.put(`/staff/customers/${id}`, data),
  // Admin
  getAdminCustomers: (params) => api.get('/admin/customers', { params }),
  getAdminCustomer: (id) => api.get(`/admin/customers/${id}`),
  updateAdminCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
  toggleCustomerLock: (id) => api.put(`/admin/customers/${id}/lock`),
  getAdminCustomerDevices: (id) => api.get(`/admin/customers/${id}/devices`),
  getAdminCustomerTickets: (id, params) => api.get(`/admin/customers/${id}/tickets`, { params }),
};
