export const API_BASE_URL = 'http://localhost:8080/api';
export const WS_URL = 'http://localhost:8080/ws';
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const TICKET_STATUS_COLORS = {
  RECEIVED: 'blue',
  DIAGNOSING: 'orange',
  QUOTED: 'purple',
  APPROVED: 'cyan',
  REPAIRING: 'geekblue',
  COMPLETED: 'green',
  DELIVERED: 'success',
  CANCELLED: 'default',
  REJECTED: 'red',
};

export const INVOICE_STATUS_COLORS = {
  UNPAID: 'red',
  PARTIALLY_PAID: 'orange',
  PAID: 'green',
};

export const TICKET_STATUS_LABELS = {
  RECEIVED: 'Đã tiếp nhận',
  DIAGNOSING: 'Đang chẩn đoán',
  QUOTED: 'Đã báo giá',
  APPROVED: 'Khách đồng ý',
  REPAIRING: 'Đang sửa chữa',
  COMPLETED: 'Đã hoàn thành',
  DELIVERED: 'Đã bàn giao',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
};
