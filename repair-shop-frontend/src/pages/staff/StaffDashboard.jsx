import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Statistic, Spin, message } from 'antd';
import { PlusOutlined, ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function StaffDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getStaffTickets({ size: 10, sort: 'updatedAt,desc' });
      setTickets(res.data?.data?.content || []);
    } catch {
      message.error('Lỗi khi tải dữ liệu phiếu sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const activeTickets = tickets.filter(t => ['RECEIVED', 'DIAGNOSING', 'QUOTED', 'APPROVED', 'REPAIRING'].includes(t.status));
  const doneTickets = tickets.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.status));

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (code, r) => (
        <span style={{ fontWeight: 600, color: '#a78bfa' }}>{code}</span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => name || '—',
    },
    {
      title: 'Thiết bị',
      key: 'device',
      render: (_, r) => (
        <span>
          {r.deviceBrand || ''} {r.deviceModel || ''}
          {(r.deviceSerialNumber || r.serialNumber) && (
            <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>
              ({r.deviceSerialNumber || r.serialNumber})
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <TicketStatusBadge status={status} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/staff/tickets/${record.ticketId || record.id}`)}
          style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: 'white' }}>Bảng điều khiển Nhân viên</h2>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Theo dõi các phiếu sửa chữa được phân công</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/staff/tickets/create')}
          style={{ background: '#7c3aed', borderColor: '#7c3aed', height: 40, borderRadius: 8 }}
        >
          Tạo phiếu mới
        </Button>
      </div>

      {/* Stats row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="glass-card" style={{ background: '#1a1a2e', border: '1px solid #2d2b52' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>Tổng phiếu phụ trách</span>}
              value={tickets.length}
              prefix={<ToolOutlined style={{ color: '#7c3aed' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="glass-card" style={{ background: '#1a1a2e', border: '1px solid #2d2b52' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>Đang xử lý</span>}
              value={activeTickets.length}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="glass-card" style={{ background: '#1a1a2e', border: '1px solid #2d2b52' }}>
            <Statistic
              title={<span style={{ color: '#9ca3af' }}>Đã hoàn tất / Bàn giao</span>}
              value={doneTickets.length}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ color: 'white' }}>Danh sách việc cần làm gần đây</span>}
        className="glass-card"
        extra={
          <Button type="link" onClick={() => navigate('/staff/tickets')} style={{ color: '#a78bfa' }}>
            Xem tất cả <ArrowRightOutlined />
          </Button>
        }
      >
        <Table
          dataSource={tickets}
          columns={columns}
          rowKey={(r) => r.ticketId || r.id}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
