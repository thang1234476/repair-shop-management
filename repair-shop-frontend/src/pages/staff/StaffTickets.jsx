import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Card, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'RECEIVED', label: 'Đã tiếp nhận' },
  { value: 'DIAGNOSING', label: 'Đang kiểm tra' },
  { value: 'QUOTED', label: 'Đã có báo giá' },
  { value: 'APPROVED', label: 'Đã xác nhận' },
  { value: 'REPAIRING', label: 'Đang sửa chữa' },
  { value: 'COMPLETED', label: 'Đã sửa xong' },
  { value: 'DELIVERED', label: 'Đã bàn giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'REJECTED', label: 'Đã từ chối' },
];

export default function StaffTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const fetchTickets = async (p = page, s = pageSize) => {
    setLoading(true);
    try {
      const res = await ticketApi.getStaffTickets({
        page: p,
        size: s,
        sort: 'createdAt,desc',
      });
      const data = res.data?.data;
      setTickets(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch {
      message.error('Lỗi khi tải danh sách phiếu sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(page, pageSize);
  }, [page, pageSize]);

  // Client-side filtering for search & status on loaded tickets
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchSearch =
      !search ||
      t.ticketCode?.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceBrand?.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceModel?.toLowerCase().includes(search.toLowerCase()) ||
      (t.deviceSerialNumber || t.serialNumber)?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (code) => <span style={{ fontWeight: 700, color: '#a78bfa' }}>{code}</span>,
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
        <div>
          <div style={{ fontWeight: 500 }}>
            {r.deviceBrand || ''} {r.deviceModel || ''}
          </div>
          {(r.deviceSerialNumber || r.serialNumber) && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              S/N: {r.deviceSerialNumber || r.serialNumber}
            </div>
          )}
        </div>
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
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: 'white' }}>Danh sách phiếu sửa chữa</h2>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Các phiếu sửa chữa được phân công cho bạn</p>
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

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input
              placeholder="Tìm mã phiếu, khách, thiết bị, S/N..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              style={{ width: 180 }}
            />
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchTickets(page, pageSize)}>
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          dataSource={filteredTickets}
          columns={columns}
          rowKey={(r) => r.ticketId || r.id}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total: totalElements,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
            },
            showTotal: (total) => `Tổng cộng ${total} phiếu`,
          }}
        />
      </Card>
    </div>
  );
}
