import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { inventoryApi } from '../../api/inventoryApi';

export default function AdminInventory() {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    inventoryApi.getAdminInventory({ size: 50 }).then(res => setParts(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Mã LK', dataIndex: 'partCode', key: 'code' },
    { title: 'Tên', dataIndex: 'partName', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'qty' },
    { title: 'Giá nhập', dataIndex: 'purchasePrice', key: 'buy' },
    { title: 'Giá bán', dataIndex: 'sellingPrice', key: 'sell' },
  ];

  return (
    <div>
      <h2>Quản lý Kho (Admin)</h2>
      <Table dataSource={parts} columns={columns} rowKey="id" />
    </div>
  );
}
