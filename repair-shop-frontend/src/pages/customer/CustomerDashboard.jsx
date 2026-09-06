import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [searchCode, setSearchCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketApi.getMyTickets({ size: 5, sort: 'createdAt,desc' });
      const data = res.data.data.content;
      setTickets(data);
      // Mock stats for now
      setStats({
        total: res.data.data.totalElements,
        pending: data.filter(t => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(t.status)).length,
        completed: data.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.status)).length
      });
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    }
  };

  const handleSearch = async () => {
    if (!searchCode) return;
    try {
      const res = await ticketApi.lookupTicket(searchCode);
      navigate(`/customer/tickets/${res.data.data.id}`);
    } catch (error) {
      message.error('Không tìm thấy phiếu sửa chữa');
    }
  };

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'code' },
    { title: 'Thiết bị', dataIndex: ['device', 'model'], key: 'device' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <TicketStatusBadge status={status} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', render: (date) => formatDate(date) },
    { title: 'Thao tác', key: 'action', render: (_, record) => <Button type="link" onClick={() => navigate(`/customer/tickets/${record.id}`)}>Chi tiết</Button> }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><div className="stat-card"><h3>Tổng phiếu</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{stats.total}</p></div></Col>
        <Col span={8}><div className="stat-card"><h3>Đang xử lý</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{stats.pending}</p></div></Col>
        <Col span={8}><div className="stat-card"><h3>Đã hoàn thành</h3><p style={{fontSize: 24, fontWeight: 'bold'}}>{stats.completed}</p></div></Col>
      </Row>
      <Card title={<span style={{color:'white'}}>Tra cứu phiếu</span>} className="glass-card" style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder="Nhập mã phiếu hoặc quét QR"
          allowClear
          enterButton="Tra cứu"
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchCode(e.target.value)}
        />
      </Card>
      <Card title={<span style={{color:'white'}}>Phiếu sửa chữa gần đây</span>} className="glass-card">
        <Table dataSource={tickets} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
