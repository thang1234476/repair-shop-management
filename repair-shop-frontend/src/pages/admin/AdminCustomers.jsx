import React, { useState, useEffect } from 'react';
import { Table, message, Tag } from 'antd';
import { customerApi } from '../../api/customerApi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    customerApi.getAdminCustomers({ size: 50 }).then(res => setCustomers(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Tên', dataIndex: 'fullName', key: 'name' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: a => <Tag color={a ? 'green' : 'red'}>{a ? 'Hoạt động' : 'Khóa'}</Tag> },
  ];

  return (
    <div>
      <h2>Quản lý Khách hàng</h2>
      <Table dataSource={customers} columns={columns} rowKey="id" />
    </div>
  );
}
