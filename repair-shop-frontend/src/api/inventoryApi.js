import api from './axiosInstance';
export const inventoryApi = {
  getInventory: (params) => api.get('/staff/inventory', { params }),
  importParts: (data) => api.post('/staff/inventory/import', data),
  exportParts: (data) => api.post('/staff/inventory/export', data),
  getAdminInventory: (params) => api.get('/admin/inventory', { params }),
  getTransactions: (params) => api.get('/admin/inventory/transactions', { params }),
};
