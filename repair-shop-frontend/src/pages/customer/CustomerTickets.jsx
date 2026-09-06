import React, { useState, useEffect } from 'react';
import { Table, Select, Button, message } from 'antd';
import { ticketApi } from '../../api/ticketApi';
import { TicketStatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function CustomerTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getMyTickets({ status: statusFilter, sort: 'createdAt,desc' });
      setTickets(res.data.data.content);
    } catch (error) {
      message.error('Lỗi khi tải danh sách phiếu');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'code' },
    { title: 'Thiết bị', dataIndex: ['device', 'model'], key: 'device' },
    { title: 'Tình trạng', dataIndex: 'issueDescription', key: 'issue' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <TicketStatusBadge status={status} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', render: (date) => formatDate(date) },
    { title: 'Thao tác', key: 'action', render: (_, record) => <Button type="primary" onClick={() => navigate(`/customer/tickets/${record.id}`)}>Chi tiết</Button> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Danh sách phiếu sửa chữa</h2>
        <Select placeholder="Lọc theo trạng thái" style={{ width: 200 }} allowClear onChange={setStatusFilter}>
          <Option value="RECEIVED">Đã tiếp nhận</Option>
          <Option value="DIAGNOSING">Đang chẩn đoán</Option>
          <Option value="QUOTED">Đã báo giá</Option>
          <Option value="REPAIRING">Đang sửa chữa</Option>
          <Option value="COMPLETED">Đã hoàn thành</Option>
        </Select>
      </div>
      <Table dataSource={tickets} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
