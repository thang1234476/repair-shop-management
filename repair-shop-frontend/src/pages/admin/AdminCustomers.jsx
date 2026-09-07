import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Button, Tag, Space, Modal, Form, Select, DatePicker,
  Descriptions, Tabs, message, Popconfirm, Drawer, Badge, Card, Row, Col,
  Statistic, Tooltip, Avatar, Typography, Divider
} from 'antd';
import {
  SearchOutlined, LockOutlined, UnlockOutlined, EyeOutlined,
  EditOutlined, MobileOutlined, HistoryOutlined, UserOutlined,
  ReloadOutlined, MailOutlined, PhoneOutlined, HomeOutlined,
  CalendarOutlined, TeamOutlined
} from '@ant-design/icons';
import { customerApi } from '../../api/customerApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TICKET_STATUS_COLOR = {
  RECEIVED: 'blue', DIAGNOSING: 'orange', QUOTED: 'purple',
  APPROVED: 'cyan', REPAIRING: 'gold', COMPLETED: 'green',
  DELIVERED: 'default', CANCELLED: 'red', REJECTED: 'volcano',
};

const TICKET_STATUS_LABEL = {
  RECEIVED: 'Tiếp nhận', DIAGNOSING: 'Chẩn đoán', QUOTED: 'Báo giá',
  APPROVED: 'Đã duyệt', REPAIRING: 'Đang sửa', COMPLETED: 'Hoàn tất',
  DELIVERED: 'Đã giao', CANCELLED: 'Hủy', REJECTED: 'Từ chối',
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  // Drawer - Profile detail
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDevices, setCustomerDevices] = useState([]);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal - Edit profile
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  // Fetch customers
  const fetchCustomers = useCallback(async (page = 1, pageSize = 10, searchVal = search) => {
    setLoading(true);
    try {
      const res = await customerApi.getAdminCustomers({
        page: page - 1,
        size: pageSize,
        search: searchVal || undefined,
      });
      const data = res.data.data;
      setCustomers(data.content || []);
      setPagination({ current: page, pageSize, total: data.totalElements || 0 });
    } catch {
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, []);

  // Fetch customer detail + devices + tickets
  const openDetail = async (customer) => {
    setDrawerVisible(true);
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const [detail, devices, tickets] = await Promise.all([
        customerApi.getAdminCustomer(customer.customerId),
        customerApi.getAdminCustomerDevices(customer.customerId),
        customerApi.getAdminCustomerTickets(customer.customerId, { page: 0, size: 20 }),
      ]);
      setSelectedCustomer(detail.data.data);
      setCustomerDevices(devices.data.data || []);
      setCustomerTickets(tickets.data.data?.content || []);
    } catch {
      message.error('Không thể tải chi tiết khách hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle lock
  const handleToggleLock = async (customerId, currentStatus) => {
    try {
      await customerApi.toggleCustomerLock(customerId);
      const action = currentStatus === 'ACTIVE' ? 'Khóa' : 'Mở khóa';
      message.success(`${action} tài khoản thành công!`);
      fetchCustomers(pagination.current, pagination.pageSize);
      // update selected customer if drawer open
      if (selectedCustomer?.customerId === customerId) {
        setSelectedCustomer(prev => ({
          ...prev,
          status: prev.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
        }));
      }
    } catch {
      message.error('Thao tác thất bại, vui lòng thử lại');
    }
  };

  // Open edit modal
  const openEdit = (customer) => {
    setEditModalVisible(true);
    editForm.setFieldsValue({
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth ? dayjs(customer.dateOfBirth) : null,
      gender: customer.gender,
      note: customer.note,
    });
  };

  // Submit edit
  const handleEditSubmit = async (values) => {
    setEditLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };
      await customerApi.updateAdminCustomer(selectedCustomer.customerId, payload);
      message.success('Cập nhật hồ sơ thành công!');
      setEditModalVisible(false);
      fetchCustomers(pagination.current, pagination.pageSize);
      // refresh selected
      const updated = await customerApi.getAdminCustomer(selectedCustomer.customerId);
      setSelectedCustomer(updated.data.data);
    } catch {
      message.error('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setEditLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}><MailOutlined /> {r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: p => p ? <><PhoneOutlined /> {p}</> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => (
        <Badge
          status={s === 'ACTIVE' ? 'success' : 'error'}
          text={s === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
        />
      ),
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Bị khóa', value: 'LOCKED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: g => g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : g === 'OTHER' ? 'Khác' : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem hồ sơ">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} type="primary" ghost
              onClick={() => { setSelectedCustomer(r); openEdit(r); }} />
          </Tooltip>
          <Tooltip title={r.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <Popconfirm
              title={`${r.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản khách hàng này?`}
              onConfirm={() => handleToggleLock(r.customerId, r.status)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                size="small"
                icon={r.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
                danger={r.status === 'ACTIVE'}
                type={r.status === 'LOCKED' ? 'primary' : 'default'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Device columns
  const deviceColumns = [
    { title: 'Loại thiết bị', dataIndex: 'deviceType', key: 'deviceType' },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Serial', dataIndex: 'serialNumber', key: 'serialNumber', render: v => v || '—' },
    { title: 'IMEI', dataIndex: 'imei', key: 'imei', render: v => v || '—' },
    {
      title: 'Tình trạng ban đầu',
      dataIndex: 'initialCondition',
      key: 'initialCondition',
      ellipsis: true,
      render: v => v || '—',
    },
  ];

  // Ticket columns
  const ticketColumns = [
    { title: 'Mã phiếu', dataIndex: 'ticketCode', key: 'ticketCode',
      render: c => <Text strong style={{ color: '#7c3aed' }}>{c}</Text> },
    { title: 'Thiết bị', dataIndex: 'deviceModel', key: 'deviceModel', render: v => v || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color={TICKET_STATUS_COLOR[s]}>{TICKET_STATUS_LABEL[s] || s}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: d => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <TeamOutlined style={{ color: '#7c3aed', marginRight: 8 }} />
            Quản lý Khách hàng
          </Title>
          <Text type="secondary">Tổng: <strong>{pagination.total}</strong> khách hàng</Text>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Tìm theo tên, email, SĐT..."
              allowClear
              enterButton={<><SearchOutlined /> Tìm</>}
              style={{ width: 320 }}
              onSearch={val => { setSearch(val); fetchCustomers(1, pagination.pageSize, val); }}
              onChange={e => { if (!e.target.value) { setSearch(''); fetchCustomers(1, pagination.pageSize, ''); } }}
            />
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={() => fetchCustomers(pagination.current, pagination.pageSize)} />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* Table */}
      <Table
        dataSource={customers}
        columns={columns}
        rowKey="customerId"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} khách hàng`,
          onChange: (page, pageSize) => fetchCustomers(page, pageSize),
        }}
        scroll={{ x: 700 }}
      />

      {/* Customer Detail Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar size={36} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }} icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{selectedCustomer?.fullName}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{selectedCustomer?.email}</Text>
            </div>
          </Space>
        }
        width={820}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} type="primary" ghost
              onClick={() => { openEdit(selectedCustomer); }}>
              Chỉnh sửa
            </Button>
            <Popconfirm
              title={`${selectedCustomer?.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản này?`}
              onConfirm={() => handleToggleLock(selectedCustomer?.customerId, selectedCustomer?.status)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                icon={selectedCustomer?.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
                danger={selectedCustomer?.status === 'ACTIVE'}
                type={selectedCustomer?.status === 'LOCKED' ? 'primary' : 'default'}
              >
                {selectedCustomer?.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {selectedCustomer && (
          <Tabs defaultActiveKey="profile">
            <TabPane
              tab={<span><UserOutlined />Hồ sơ</span>}
              key="profile"
            >
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', background: '#f8f6ff', border: '1px solid #e9d5ff' }}>
                    <Avatar size={64} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', marginBottom: 8 }} icon={<UserOutlined />} />
                    <div style={{ fontWeight: 700 }}>{selectedCustomer.fullName}</div>
                    <Badge status={selectedCustomer.status === 'ACTIVE' ? 'success' : 'error'}
                      text={selectedCustomer.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'} />
                  </Card>
                </Col>
                <Col span={16}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic title="Thiết bị" value={customerDevices.length} prefix={<MobileOutlined />} valueStyle={{ color: '#7c3aed' }} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Phiếu sửa chữa" value={customerTickets.length} prefix={<HistoryOutlined />} valueStyle={{ color: '#2563eb' }} />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Descriptions column={1} bordered size="small" labelStyle={{ width: 140 }}>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>{selectedCustomer.email || '—'}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>{selectedCustomer.phone || '—'}</Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>{selectedCustomer.address || '—'}</Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày sinh</>}>
                  {selectedCustomer.dateOfBirth ? dayjs(selectedCustomer.dateOfBirth).format('DD/MM/YYYY') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedCustomer.gender === 'MALE' ? 'Nam' : selectedCustomer.gender === 'FEMALE' ? 'Nữ' : selectedCustomer.gender === 'OTHER' ? 'Khác' : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{selectedCustomer.note || '—'}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane
              tab={<span><MobileOutlined />Thiết bị ({customerDevices.length})</span>}
              key="devices"
            >
              <Table
                dataSource={customerDevices}
                columns={deviceColumns}
                rowKey="deviceId"
                size="small"
                loading={detailLoading}
                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                locale={{ emptyText: 'Khách hàng chưa có thiết bị nào' }}
              />
            </TabPane>

            <TabPane
              tab={<span><HistoryOutlined />Lịch sử sửa chữa ({customerTickets.length})</span>}
              key="tickets"
            >
              <Table
                dataSource={customerTickets}
                columns={ticketColumns}
                rowKey="ticketId"
                size="small"
                loading={detailLoading}
                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                locale={{ emptyText: 'Chưa có phiếu sửa chữa nào' }}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* Edit Customer Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#7c3aed' }} />
            Cập nhật hồ sơ khách hàng
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={560}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về khách hàng..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
