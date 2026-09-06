import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { customerApi } from '../../api/customerApi';

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    customerApi.getCustomers({ size: 50 }).then(res => setCustomers(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Tên', dataIndex: 'fullName', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <div>
      <h2>Khách hàng</h2>
      <Table dataSource={customers} columns={columns} rowKey="id" />
    </div>
  );
}
