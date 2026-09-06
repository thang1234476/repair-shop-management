import React, { useState, useEffect } from 'react';
import { Table, message, Tag } from 'antd';
import { staffApi } from '../../api/staffApi';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    staffApi.getAllStaff({ size: 50 }).then(res => setStaff(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Tên', dataIndex: 'fullName', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vị trí', dataIndex: 'position', key: 'position' },
    { title: 'Trạng thái', dataIndex: 'active', key: 'active', render: a => <Tag color={a ? 'green' : 'red'}>{a ? 'Hoạt động' : 'Đã khóa'}</Tag> },
  ];

  return (
    <div>
      <h2>Quản lý Nhân viên</h2>
      <Table dataSource={staff} columns={columns} rowKey="id" />
    </div>
  );
}
