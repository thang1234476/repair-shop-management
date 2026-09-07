import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Button, Tag, Space, Modal, Form, Select, InputNumber,
  Descriptions, Tabs, message, Drawer, Badge, Card, Row, Col,
  Statistic, Tooltip, Typography, Divider, Alert, Progress, Popconfirm
} from 'antd';
import {
  SearchOutlined, EyeOutlined, EditOutlined, PlusOutlined,
  ReloadOutlined, WarningOutlined, BoxPlotOutlined, ImportOutlined,
  HistoryOutlined, ArrowUpOutlined, ArrowDownOutlined, ShopOutlined,
  DatabaseOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { inventoryApi } from '../../api/inventoryApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const formatCurrency = (val) =>
  val != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

export default function AdminInventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPagination, setTxPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [activeTab, setActiveTab] = useState('parts');

  // Drawer for part detail
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Modal - Create part
  const [createVisible, setCreateVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // Modal - Edit part
  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  // Modal - Import stock
  const [importVisible, setImportVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importForm] = Form.useForm();
  const [importTarget, setImportTarget] = useState(null); // null = any part, part object = specific part

  // Fetch parts
  const fetchParts = useCallback(async (page = 1, pageSize = 10, searchVal = search) => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAdminInventory({
        page: page - 1, size: pageSize, search: searchVal || undefined,
      });
      const data = res.data.data;
      setParts(data.content || []);
      setPagination({ current: page, pageSize, total: data.totalElements || 0 });
    } catch {
      message.error('Không thể tải danh sách linh kiện');
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1, pageSize = 10) => {
    setTxLoading(true);
    try {
      const res = await inventoryApi.getTransactions({ page: page - 1, size: pageSize });
      const data = res.data.data;
      setTransactions(data.content || []);
      setTxPagination({ current: page, pageSize, total: data.totalElements || 0 });
    } catch {
      message.error('Không thể tải lịch sử giao dịch');
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => { fetchParts(); }, []);
  useEffect(() => {
    if (activeTab === 'history') fetchTransactions();
  }, [activeTab]);

  // Stats
  const lowStockCount = parts.filter(p => p.lowStock).length;
  const totalValue = parts.reduce((s, p) => s + (p.unitPrice || 0) * (p.quantityInStock || 0), 0);

  // Handle create part
  const handleCreate = async (values) => {
    setCreateLoading(true);
    try {
      await inventoryApi.createPart(values);
      message.success('Thêm linh kiện mới thành công!');
      setCreateVisible(false);
      createForm.resetFields();
      fetchParts(1, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thêm linh kiện thất bại');
    } finally {
      setCreateLoading(false);
    }
  };

  // Open edit modal
  const openEdit = (part) => {
    setSelectedPart(part);
    setEditVisible(true);
    editForm.setFieldsValue({
      partCode: part.partCode,
      partName: part.partName,
      unit: part.unit,
      unitPrice: part.unitPrice,
      quantityInStock: part.quantityInStock,
      minStockThreshold: part.minStockThreshold,
      supplier: part.supplier,
    });
  };

  // Handle edit part
  const handleEdit = async (values) => {
    setEditLoading(true);
    try {
      await inventoryApi.updatePart(selectedPart.partId, values);
      message.success('Cập nhật linh kiện thành công!');
      setEditVisible(false);
      fetchParts(pagination.current, pagination.pageSize);
      if (drawerVisible) {
        const updated = { ...selectedPart, ...values };
        setSelectedPart(updated);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  // Open import modal
  const openImport = (part = null) => {
    setImportTarget(part);
    setImportVisible(true);
    importForm.setFieldsValue({
      partId: part ? part.partId : undefined,
      quantity: 1,
      note: '',
    });
  };

  // Handle import stock
  const handleImport = async (values) => {
    setImportLoading(true);
    try {
      await inventoryApi.adminImportStock(values);
      message.success('Nhập kho thành công!');
      setImportVisible(false);
      importForm.resetFields();
      fetchParts(pagination.current, pagination.pageSize);
      if (activeTab === 'history') fetchTransactions();
    } catch (err) {
      message.error(err.response?.data?.message || 'Nhập kho thất bại');
    } finally {
      setImportLoading(false);
    }
  };

  // Stock level indicator
  const StockIndicator = ({ part }) => {
    if (!part.minStockThreshold) return <Text>{part.quantityInStock}</Text>;
    const pct = Math.min(100, Math.round((part.quantityInStock / (part.minStockThreshold * 3)) * 100));
    const status = part.lowStock ? 'exception' : pct < 60 ? 'normal' : 'success';
    return (
      <div style={{ minWidth: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, color: part.lowStock ? '#ef4444' : '#16a34a' }}>
            {part.quantityInStock} {part.unit}
          </span>
          <Text type="secondary" style={{ fontSize: 11 }}>min: {part.minStockThreshold}</Text>
        </div>
        <Progress percent={pct} status={status} showInfo={false} size="small" strokeWidth={4} />
      </div>
    );
  };

  // Part table columns
  const columns = [
    {
      title: 'Mã LK',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 110,
      render: c => <Text strong style={{ color: '#7c3aed', fontFamily: 'monospace' }}>{c}</Text>,
    },
    {
      title: 'Tên linh kiện',
      dataIndex: 'partName',
      key: 'partName',
      render: (name, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {r.supplier && <Text type="secondary" style={{ fontSize: 11 }}><ShopOutlined /> {r.supplier}</Text>}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 150,
      render: (_, r) => <StockIndicator part={r} />,
      sorter: (a, b) => a.quantityInStock - b.quantityInStock,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: v => formatCurrency(v),
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, r) => r.lowStock
        ? <Tag icon={<WarningOutlined />} color="error">Sắp hết</Tag>
        : <Tag icon={<CheckCircleOutlined />} color="success">Đủ hàng</Tag>,
      filters: [
        { text: 'Sắp hết hàng', value: true },
        { text: 'Đủ hàng', value: false },
      ],
      onFilter: (value, record) => record.lowStock === value,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedPart(r); setDrawerVisible(true); }} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} type="primary" ghost onClick={() => openEdit(r)} />
          </Tooltip>
          <Tooltip title="Nhập thêm vào kho">
            <Button size="small" icon={<ImportOutlined />}
              style={{ color: '#059669', borderColor: '#059669' }}
              onClick={() => openImport(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Transaction history columns
  const txColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'transactionDate',
      key: 'date',
      render: d => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—',
      sorter: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: t => t === 'IN'
        ? <Tag icon={<ArrowDownOutlined />} color="success">Nhập</Tag>
        : <Tag icon={<ArrowUpOutlined />} color="error">Xuất</Tag>,
      filters: [
        { text: 'Nhập kho', value: 'IN' },
        { text: 'Xuất kho', value: 'OUT' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Linh kiện',
      dataIndex: 'partName',
      key: 'partName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, r) => (
        <Text strong style={{ color: r.type === 'IN' ? '#16a34a' : '#dc2626' }}>
          {r.type === 'IN' ? '+' : '-'}{qty}
        </Text>
      ),
    },
    {
      title: 'Phiếu liên quan',
      dataIndex: 'relatedTicketCode',
      key: 'ticket',
      render: v => v ? <Tag color="purple">{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Thực hiện bởi',
      dataIndex: 'performedBy',
      key: 'performedBy',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: v => v || '—',
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <DatabaseOutlined style={{ color: '#7c3aed', marginRight: 8 }} />
            Quản lý Kho linh kiện
          </Title>
          <Text type="secondary">Tổng: <strong>{pagination.total}</strong> loại linh kiện</Text>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={() => fetchParts(pagination.current, pagination.pageSize)} />
            </Tooltip>
            <Button
              icon={<ImportOutlined />}
              style={{ color: '#059669', borderColor: '#059669' }}
              onClick={() => openImport(null)}
            >
              Nhập kho
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}
              onClick={() => { createForm.resetFields(); setCreateVisible(true); }}
            >
              Thêm linh kiện
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Summary cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #7c3aed' }}>
            <Statistic title="Tổng loại linh kiện" value={pagination.total}
              prefix={<BoxPlotOutlined />} valueStyle={{ color: '#7c3aed', fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #ef4444' }}>
            <Statistic title="Sắp hết hàng" value={lowStockCount}
              prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444', fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #2563eb' }}>
            <Statistic title="Tổng tồn kho" value={parts.reduce((s, p) => s + (p.quantityInStock || 0), 0)}
              suffix="cái" valueStyle={{ color: '#2563eb', fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #059669' }}>
            <Statistic title="Giá trị kho (ước tính)"
              value={Math.round(totalValue / 1000)}
              suffix="K ₫"
              valueStyle={{ color: '#059669', fontSize: 20 }} />
          </Card>
        </Col>
      </Row>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <Alert
          message={`⚠️ Có ${lowStockCount} loại linh kiện sắp hết hàng cần nhập thêm!`}
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          action={
            <Button size="small" onClick={() => openImport(null)}>Nhập kho ngay</Button>
          }
          closable
        />
      )}

      {/* Main tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><BoxPlotOutlined />Danh sách linh kiện ({pagination.total})</span>} key="parts">
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col>
              <Search
                placeholder="Tìm theo mã, tên, nhà cung cấp..."
                allowClear
                enterButton={<><SearchOutlined /> Tìm</>}
                style={{ width: 320 }}
                onSearch={val => { setSearch(val); fetchParts(1, pagination.pageSize, val); }}
                onChange={e => { if (!e.target.value) { setSearch(''); fetchParts(1, pagination.pageSize, ''); } }}
              />
            </Col>
          </Row>
          <Table
            dataSource={parts}
            columns={columns}
            rowKey="partId"
            loading={loading}
            rowClassName={record => record.lowStock ? 'low-stock-row' : ''}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} linh kiện`,
              onChange: (page, pageSize) => fetchParts(page, pageSize),
            }}
            scroll={{ x: 800 }}
          />
        </TabPane>

        <TabPane tab={<span><HistoryOutlined />Lịch sử nhập/xuất</span>} key="history">
          <Table
            dataSource={transactions}
            columns={txColumns}
            rowKey="transactionId"
            loading={txLoading}
            pagination={{
              current: txPagination.current,
              pageSize: txPagination.pageSize,
              total: txPagination.total,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} giao dịch`,
              onChange: (page, pageSize) => fetchTransactions(page, pageSize),
            }}
            scroll={{ x: 900 }}
            locale={{ emptyText: 'Chưa có giao dịch nào' }}
          />
        </TabPane>
      </Tabs>

      {/* ============ DETAIL DRAWER ============ */}
      <Drawer
        title={
          <Space>
            <BoxPlotOutlined style={{ color: '#7c3aed' }} />
            <div>
              <div style={{ fontWeight: 700 }}>{selectedPart?.partName}</div>
              <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c3aed' }}>{selectedPart?.partCode}</Text>
            </div>
          </Space>
        }
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} type="primary" ghost onClick={() => openEdit(selectedPart)}>
              Chỉnh sửa
            </Button>
            <Button icon={<ImportOutlined />} style={{ color: '#059669', borderColor: '#059669' }}
              onClick={() => openImport(selectedPart)}>
              Nhập kho
            </Button>
          </Space>
        }
      >
        {selectedPart && (
          <>
            {selectedPart.lowStock && (
              <Alert
                message="Linh kiện này đang ở mức tồn kho thấp!"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: selectedPart.lowStock ? '#fef2f2' : '#f0fdf4' }}>
                  <Statistic
                    title="Tồn kho"
                    value={selectedPart.quantityInStock}
                    suffix={selectedPart.unit}
                    valueStyle={{ color: selectedPart.lowStock ? '#dc2626' : '#16a34a', fontSize: 24 }}
                    prefix={selectedPart.lowStock ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Ngưỡng tối thiểu: {selectedPart.minStockThreshold || '—'}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#f8f6ff' }}>
                  <Statistic
                    title="Đơn giá"
                    value={selectedPart.unitPrice}
                    formatter={v => formatCurrency(v)}
                    valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions column={1} bordered size="small" labelStyle={{ width: 150 }}>
              <Descriptions.Item label="Mã linh kiện">
                <Text code>{selectedPart.partCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên linh kiện">{selectedPart.partName}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị">{selectedPart.unit || '—'}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{selectedPart.supplier || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngưỡng tối thiểu">
                {selectedPart.minStockThreshold || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thêm vào">
                {selectedPart.createdAt ? dayjs(selectedPart.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
            </Descriptions>

            {selectedPart.quantityInStock !== undefined && selectedPart.minStockThreshold && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>Mức tồn kho</Text>
                  <Text type="secondary">{selectedPart.quantityInStock} / {selectedPart.minStockThreshold * 3}</Text>
                </div>
                <Progress
                  percent={Math.min(100, Math.round(selectedPart.quantityInStock / (selectedPart.minStockThreshold * 3) * 100))}
                  status={selectedPart.lowStock ? 'exception' : 'success'}
                  strokeWidth={8}
                />
              </div>
            )}
          </>
        )}
      </Drawer>

      {/* ============ CREATE MODAL ============ */}
      <Modal
        title={<Space><PlusOutlined style={{ color: '#7c3aed' }} />Thêm linh kiện mới</Space>}
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        width={560}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item name="partCode" label="Mã linh kiện"
                rules={[{ required: true, message: 'Nhập mã' }, { max: 30 }]}>
                <Input placeholder="VD: LK-001" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="partName" label="Tên linh kiện"
                rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input placeholder="Tên linh kiện" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị">
                <Select placeholder="Đơn vị" allowClear>
                  <Option value="cái">Cái</Option>
                  <Option value="chiếc">Chiếc</Option>
                  <Option value="bộ">Bộ</Option>
                  <Option value="cặp">Cặp</Option>
                  <Option value="m">Mét</Option>
                  <Option value="cm">Cm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="unitPrice" label="Đơn giá (VNĐ)"
                rules={[{ required: true, message: 'Nhập đơn giá' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/,/g, '')}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="quantityInStock" label="Số lượng ban đầu"
                rules={[{ required: true, message: 'Nhập số lượng' }]}
                initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minStockThreshold" label="Ngưỡng cảnh báo tối thiểu" initialValue={5}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input placeholder="Tên nhà cung cấp" prefix={<ShopOutlined />} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                <CheckCircleOutlined /> Thêm linh kiện
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ============ EDIT MODAL ============ */}
      <Modal
        title={<Space><EditOutlined style={{ color: '#7c3aed' }} />Cập nhật: {selectedPart?.partName}</Space>}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        width={520}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="partCode" label="Mã linh kiện">
            <Input disabled style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="partName" label="Tên linh kiện"
            rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="Tên linh kiện" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị">
                <Select allowClear placeholder="Đơn vị">
                  <Option value="cái">Cái</Option>
                  <Option value="chiếc">Chiếc</Option>
                  <Option value="bộ">Bộ</Option>
                  <Option value="cặp">Cặp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="unitPrice" label="Đơn giá (VNĐ)"
                rules={[{ required: true, message: 'Nhập đơn giá' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/,/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="quantityInStock" label="Số lượng tồn kho">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minStockThreshold" label="Ngưỡng cảnh báo">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input placeholder="Tên nhà cung cấp" prefix={<ShopOutlined />} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ============ IMPORT STOCK MODAL ============ */}
      <Modal
        title={
          <Space>
            <ImportOutlined style={{ color: '#059669' }} />
            {importTarget ? `Nhập kho: ${importTarget.partName}` : 'Nhập kho linh kiện'}
          </Space>
        }
        open={importVisible}
        onCancel={() => setImportVisible(false)}
        footer={null}
        width={460}
      >
        <Form form={importForm} layout="vertical" onFinish={handleImport} style={{ marginTop: 16 }}>
          {!importTarget && (
            <Form.Item name="partId" label="Chọn linh kiện"
              rules={[{ required: true, message: 'Vui lòng chọn linh kiện' }]}>
              <Select
                showSearch
                placeholder="Tìm và chọn linh kiện..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {parts.map(p => (
                  <Option key={p.partId} value={p.partId}>
                    [{p.partCode}] {p.partName} — Tồn: {p.quantityInStock} {p.unit}
                    {p.lowStock && ' ⚠️'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {importTarget && (
            <Alert
              message={
                <span>
                  Tồn kho hiện tại: <strong>{importTarget.quantityInStock} {importTarget.unit}</strong>
                  {importTarget.lowStock && <Tag color="error" style={{ marginLeft: 8 }}>Sắp hết</Tag>}
                </span>
              }
              type={importTarget.lowStock ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item name="quantity" label="Số lượng nhập"
            rules={[{ required: true, message: 'Nhập số lượng' }, { type: 'number', min: 1, message: 'Tối thiểu 1' }]}>
            <InputNumber style={{ width: '100%' }} min={1} size="large" addonAfter={importTarget?.unit || 'cái'} />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú nhập kho (nguồn hàng, lý do...)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setImportVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={importLoading}
                style={{ background: '#059669', border: 'none' }}>
                <ImportOutlined /> Xác nhận nhập kho
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
