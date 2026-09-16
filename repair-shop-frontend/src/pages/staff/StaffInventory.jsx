import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, InputNumber, Select, Space, Card, Tag, Alert, message } from 'antd';
import { PlusOutlined, ExportOutlined, SearchOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { inventoryApi } from '../../api/inventoryApi';
import { ticketApi } from '../../api/ticketApi';
import { formatCurrency } from '../../utils/helpers';

const { Option } = Select;

export default function StaffInventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const [importForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async (p = page, s = pageSize, q = search) => {
    setLoading(true);
    try {
      const res = await inventoryApi.getInventory({
        search: q || undefined,
        page: p,
        size: s,
      });
      const data = res.data?.data;
      setParts(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch {
      message.error('Lỗi khi tải danh sách linh kiện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(page, pageSize, search);
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(0);
    fetchInventory(0, pageSize, search);
  };

  const fetchActiveTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await ticketApi.getStaffTickets({ size: 100 });
      // Lọc các phiếu đang trong quá trình chẩn đoán/sửa chữa
      const active = (res.data?.data?.content || []).filter(t =>
        ['RECEIVED', 'DIAGNOSING', 'APPROVED', 'REPAIRING'].includes(t.status)
      );
      setTickets(active);
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Open Import Modal
  const openImportModal = (record = null) => {
    setSelectedPart(record);
    importForm.resetFields();
    if (record) {
      importForm.setFieldsValue({ partId: record.partId || record.id });
    }
    setImportModalOpen(true);
  };

  // Open Export Modal
  const openExportModal = (record = null) => {
    setSelectedPart(record);
    exportForm.resetFields();
    if (record) {
      exportForm.setFieldsValue({ partId: record.partId || record.id });
    }
    fetchActiveTickets();
    setExportModalOpen(true);
  };

  // Handle Import Submit
  const handleImportSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        partId: values.partId,
        quantity: values.quantity,
        note: values.note,
      };
      await inventoryApi.importParts(payload);
      message.success('Nhập kho linh kiện thành công!');
      setImportModalOpen(false);
      fetchInventory(page, pageSize, search);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi nhập kho');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Export Submit
  const handleExportSubmit = async (values) => {
    const partToExport = parts.find(p => (p.partId || p.id) === values.partId) || selectedPart;
    if (partToExport && values.quantity > partToExport.quantityInStock) {
      message.error(`Số lượng xuất (${values.quantity}) vượt quá tồn kho hiện tại (${partToExport.quantityInStock})`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        partId: values.partId,
        ticketId: values.ticketId,
        quantity: values.quantity,
        note: values.note,
      };
      await inventoryApi.exportParts(payload);
      message.success('Xuất kho linh kiện gắn vào phiếu thành công!');
      setExportModalOpen(false);
      fetchInventory(page, pageSize, search);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xuất kho');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã LK',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 120,
      render: (code) => <span style={{ fontWeight: 700, color: '#a78bfa' }}>{code}</span>,
    },
    {
      title: 'Tên linh kiện',
      dataIndex: 'partName',
      key: 'partName',
      render: (name) => <span style={{ fontWeight: 600, color: '#fff' }}>{name}</span>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (u) => u || 'cái',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      width: 130,
      render: (qty, r) => {
        const isLow = qty <= (r.minStockThreshold || 5);
        return (
          <Tag color={isLow ? 'error' : 'success'} style={{ fontSize: 13, padding: '2px 8px' }}>
            {isLow && <WarningOutlined style={{ marginRight: 4 }} />}
            {qty} {r.unit || 'cái'}
          </Tag>
        );
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (s) => s || '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openImportModal(record)}
            style={{ color: '#10b981', borderColor: '#10b981' }}
          >
            Nhập
          </Button>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={() => openExportModal(record)}
            disabled={record.quantityInStock <= 0}
            style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
          >
            Xuất
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: 'white' }}>Kho linh kiện</h2>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Theo dõi tồn kho, nhập hàng và xuất linh kiện sửa chữa</p>
        </div>
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => openImportModal()}
            style={{ borderColor: '#10b981', color: '#10b981', height: 40 }}
          >
            Nhập kho
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => openExportModal()}
            style={{ borderColor: '#f59e0b', color: '#f59e0b', height: 40 }}
          >
            Xuất kho sửa chữa
          </Button>
        </Space>
      </div>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Tìm mã LK, tên linh kiện, nhà cung cấp..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 340 }}
              allowClear
            />
            <Button type="primary" onClick={handleSearch} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
              Tìm kiếm
            </Button>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchInventory(page, pageSize, search)}>
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          dataSource={parts}
          columns={columns}
          rowKey={(r) => r.partId || r.id}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total: totalElements,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
            },
            showTotal: (total) => `Tổng cộng ${total} loại linh kiện`,
          }}
        />
      </Card>

      {/* Modal Nhập kho */}
      <Modal
        title="Nhập kho linh kiện"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={importForm} layout="vertical" onFinish={handleImportSubmit}>
          <Form.Item
            name="partId"
            label="Linh kiện nhập"
            rules={[{ required: true, message: 'Vui lòng chọn linh kiện' }]}
          >
            <Select placeholder="Chọn linh kiện cần nhập thêm" showSearch optionFilterProp="children">
              {parts.map((p) => (
                <Option key={p.partId || p.id} value={p.partId || p.id}>
                  {p.partCode} — {p.partName} (Hiện còn: {p.quantityInStock} {p.unit || 'cái'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú nhập hàng">
            <Input.TextArea rows={2} placeholder="Nguồn nhập, số hóa đơn giao nhận (nếu có)..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setImportModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Xác nhận nhập kho
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Xuất kho gắn vào phiếu */}
      <Modal
        title="Xuất kho linh kiện gắn vào phiếu sửa chữa"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={exportForm} layout="vertical" onFinish={handleExportSubmit}>
          <Form.Item
            name="partId"
            label="Linh kiện xuất"
            rules={[{ required: true, message: 'Vui lòng chọn linh kiện' }]}
          >
            <Select placeholder="Chọn linh kiện cần xuất" showSearch optionFilterProp="children">
              {parts.map((p) => (
                <Option key={p.partId || p.id} value={p.partId || p.id} disabled={p.quantityInStock <= 0}>
                  {p.partCode} — {p.partName} (Tồn: {p.quantityInStock} {p.unit || 'cái'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ticketId"
            label="Phiếu sửa chữa liên quan"
            rules={[{ required: true, message: 'Vui lòng chọn phiếu sửa chữa' }]}
          >
            <Select
              placeholder="Chọn phiếu sửa chữa cần gắn linh kiện"
              loading={ticketsLoading}
              showSearch
              optionFilterProp="children"
            >
              {tickets.map((t) => (
                <Option key={t.ticketId || t.id} value={t.ticketId || t.id}>
                  {t.ticketCode} — {t.customerName} ({t.deviceBrand} {t.deviceModel})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng xuất"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng xuất" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú xuất kho">
            <Input.TextArea rows={2} placeholder="Mô tả lý do thay thế, vị trí lắp..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setExportModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Xác nhận xuất kho
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
