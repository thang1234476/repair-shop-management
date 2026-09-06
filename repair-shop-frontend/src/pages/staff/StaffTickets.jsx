import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function StaffTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getStaffTickets({ sort: 'createdAt,desc' });
      setTickets(res.data.data.content);
    } catch (error) {
      message.error('Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'code' },
    { title: 'Khách hàng', dataIndex: ['customer', 'fullName'], key: 'customer' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <TicketStatusBadge status={status} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', render: (date) => formatDate(date) },
    { title: 'Thao tác', key: 'action', render: (_, record) => <Button type="primary" onClick={() => navigate(`/staff/tickets/${record.id}`)}>Chi tiết</Button> }
  ];

  return (
    <div>
      <h2>Danh sách phiếu sửa chữa (Được giao)</h2>
      <Table dataSource={tickets} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
