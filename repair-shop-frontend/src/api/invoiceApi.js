import api from './axiosInstance';
export const invoiceApi = {
  createInvoice: (data) => api.post('/staff/invoices', data),
  createPayment: (data) => api.post('/staff/payments', data),
  getInvoice: (id) => api.get(`/staff/invoices/${id}`),
  exportPdf: (id) => api.get(`/staff/invoices/${id}/export`, { responseType: 'blob' }),
  getAllInvoices: (params) => api.get('/admin/invoices', { params }),
  confirmPayment: (id) => api.put(`/admin/invoices/${id}/confirm-payment`),
  printInvoice: (id) => api.get(`/admin/invoices/${id}/print`, { responseType: 'blob' }),
};
