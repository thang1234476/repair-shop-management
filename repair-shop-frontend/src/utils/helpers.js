import dayjs from 'dayjs';

export const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-';
export const formatCurrency = (amount) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
export const formatDateOnly = (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-';
