import api from './axiosInstance';
export const staffApi = {
  getStaffProfile: () => api.get('/staff/profile'),
  updateStaffProfile: (data) => api.put('/staff/profile', data),
  // Admin
  getAllStaff: (params) => api.get('/admin/staff', { params }),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  lockStaff: (id) => api.put(`/admin/staff/${id}/lock`),
  updatePosition: (id, position) => api.put(`/admin/staff/${id}/position?position=${position}`),
  getStaffTickets: (id, params) => api.get(`/admin/staff/${id}/tickets`, { params }),
};
