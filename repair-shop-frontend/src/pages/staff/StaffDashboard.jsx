import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketApi.getStaffTickets({ size: 10, sort: 'updatedAt,desc' });
      setTickets(res.data.data.content);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    }
  };

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'code' },
    { title: 'Khách hàng', dataIndex: ['customer', 'fullName'], key: 'customer' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <TicketStatusBadge status={status} /> },
    { title: 'Thao tác', key: 'action', render: (_, record) => <Button type="link" onClick={() => navigate(`/staff/tickets/${record.id}`)}>Xử lý</Button> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>Bảng điều khiển</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/tickets/create')}>Tạo phiếu mới</Button>
      </div>
      <Card title={<span style={{color:'white'}}>Việc cần làm</span>} className="glass-card">
        <Table dataSource={tickets} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
