import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketApi.getAllTickets({ size: 50, sort: 'createdAt,desc' }).then(res => setTickets(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'code' },
    { title: 'Khách hàng', dataIndex: ['customer', 'fullName'], key: 'customer' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <TicketStatusBadge status={s} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', render: d => formatDate(d) },
  ];

  return (
    <div>
      <h2>Tất cả Phiếu sửa chữa</h2>
      <Table dataSource={tickets} columns={columns} rowKey="id" />
    </div>
  );
}
