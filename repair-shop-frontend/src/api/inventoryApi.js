import api from './axiosInstance';
export const inventoryApi = {
  // Staff
  getInventory: (params) => api.get('/staff/inventory', { params }),
  importParts: (data) => api.post('/staff/inventory/import', data),
  exportParts: (data) => api.post('/staff/inventory/export', data),
  // Admin
  getAdminInventory: (params) => api.get('/admin/inventory', { params }),
  getAdminPart: (id) => api.get(`/admin/inventory/${id}`),
  createPart: (data) => api.post('/admin/inventory', data),
  updatePart: (id, data) => api.put(`/admin/inventory/${id}`, data),
  adminImportStock: (data) => api.post('/admin/inventory/import', data),
  getTransactions: (params) => api.get('/admin/inventory/transactions', { params }),
};
