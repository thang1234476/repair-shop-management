import api from './axiosInstance';
export const ticketApi = {
  // Customer
  getMyTickets: (params) => api.get('/customer/tickets', { params }),
  getMyTicket: (id) => api.get(`/customer/tickets/${id}`),
  getTicketTimeline: (id) => api.get(`/customer/tickets/${id}/timeline`),
  lookupTicket: (code) => api.get(`/customer/tickets/lookup/${code}`),
  getTicketQuote: (id) => api.get(`/customer/tickets/${id}/quote`),
  acceptQuote: (id, data) => api.put(`/customer/quotes/${id}/accept`, data),
  rejectQuote: (id, data) => api.put(`/customer/quotes/${id}/reject`, data),
  // Staff
  createTicket: (data) => api.post('/staff/tickets', data),
  updateTicketStatus: (id, data) => api.put(`/staff/tickets/${id}/status`, data),
  updateDiagnosis: (id, data) => api.put(`/staff/tickets/${id}/diagnosis`, data),
  createQuote: (id, data) => api.post(`/staff/tickets/${id}/quote`, data),
  closeTicket: (id) => api.put(`/staff/tickets/${id}/close`),
  getStaffTickets: (params) => api.get('/staff/tickets', { params }),
  // Admin
  getAllTickets: (params) => api.get('/admin/tickets', { params }),
  getTicketAdmin: (id) => api.get(`/admin/tickets/${id}`),
  updateTicketStatusAdmin: (id, data) => api.put(`/admin/tickets/${id}/status`, data),
  getTicketTimelineAdmin: (id) => api.get(`/admin/tickets/${id}/timeline`),
  assignStaffToTicket: (id, staffId) => api.put(`/admin/tickets/${id}/assign?staffId=${staffId}`),
};
