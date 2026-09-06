import React, { useState, useEffect } from 'react';
import { Table, message, Tag } from 'antd';
import { invoiceApi } from '../../api/invoiceApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';

export default function StaffInvoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    invoiceApi.getAllInvoices({ size: 50 }).then(res => setInvoices(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Mã HĐ', dataIndex: 'invoiceCode', key: 'code' },
    { title: 'Mã Phiếu', dataIndex: ['ticket', 'ticketCode'], key: 'ticket' },
    { title: 'Tổng tiền', dataIndex: 'finalAmount', key: 'amount', render: a => formatCurrency(a) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <Tag color={INVOICE_STATUS_COLORS[s]}>{s}</Tag> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', render: d => formatDate(d) },
  ];

  return (
    <div>
      <h2>Quản lý hóa đơn</h2>
      <Table dataSource={invoices} columns={columns} rowKey="id" />
    </div>
  );
}
