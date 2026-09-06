import React, { useState, useEffect } from 'react';
import { Table, message, Tag } from 'antd';
import { inventoryApi } from '../../api/inventoryApi';
import { formatCurrency } from '../../utils/helpers';

export default function StaffInventory() {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    inventoryApi.getInventory({ size: 50 }).then(res => setParts(res.data.data.content)).catch(() => message.error('Lỗi'));
  }, []);

  const columns = [
    { title: 'Mã LK', dataIndex: 'partCode', key: 'code' },
    { title: 'Tên linh kiện', dataIndex: 'partName', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'qty', render: (q, r) => <Tag color={q <= r.reorderLevel ? 'red' : 'green'}>{q}</Tag> },
    { title: 'Giá bán', dataIndex: 'sellingPrice', key: 'price', render: p => formatCurrency(p) },
  ];

  return (
    <div>
      <h2>Kho linh kiện</h2>
      <Table dataSource={parts} columns={columns} rowKey="id" />
    </div>
  );
}
