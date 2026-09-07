import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Button, Tag, Space, Modal, Form, Select, DatePicker,
  Descriptions, Tabs, message, Popconfirm, Drawer, Badge, Card, Row, Col,
  Statistic, Tooltip, Avatar, Typography, Divider, Alert
} from 'antd';
import {
  SearchOutlined, LockOutlined, UnlockOutlined, EyeOutlined,
  EditOutlined, HistoryOutlined, UserOutlined, PlusOutlined,
  ReloadOutlined, MailOutlined, PhoneOutlined, ToolOutlined,
  CalendarOutlined, IdcardOutlined, SafetyCertificateOutlined,
  TeamOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { staffApi } from '../../api/staffApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const POSITION_LABEL = {
  TECHNICIAN: 'Kỹ thuật viên',
  RECEPTIONIST: 'Lễ tân',
  MANAGER: 'Quản lý',
};
const POSITION_COLOR = {
  TECHNICIAN: 'blue',
  RECEPTIONIST: 'green',
  MANAGER: 'purple',
};

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

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  // Drawer - Staff detail
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffTickets, setStaffTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketPagination, setTicketPagination] = useState({ current: 1, pageSize: 5, total: 0 });

  // Modal - Create staff
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // Modal - Edit staff
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  // Modal - Change position
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionForm] = Form.useForm();

  // Fetch staff list
  const fetchStaff = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await staffApi.getAllStaff({ page: page - 1, size: pageSize });
      const data = res.data.data;
      setStaffList(data.content || []);
      setPagination({ current: page, pageSize, total: data.totalElements || 0 });
    } catch {
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, []);

  // Fetch staff tickets
  const fetchStaffTickets = useCallback(async (staffId, page = 1, pageSize = 5) => {
    setTicketsLoading(true);
    try {
      const res = await staffApi.getStaffTickets(staffId, { page: page - 1, size: pageSize });
      const data = res.data.data;
      setStaffTickets(data.content || []);
      setTicketPagination({ current: page, pageSize, total: data.totalElements || 0 });
    } catch {
      message.error('Không thể tải phiếu sửa chữa');
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Open detail drawer
  const openDetail = (staff) => {
    setSelectedStaff(staff);
    setDrawerVisible(true);
    fetchStaffTickets(staff.staffId);
  };

  // Toggle lock
  const handleToggleLock = async (staffId, currentStatus) => {
    try {
      await staffApi.lockStaff(staffId);
      const action = currentStatus === 'ACTIVE' ? 'Khóa' : 'Mở khóa';
      message.success(`${action} tài khoản thành công!`);
      fetchStaff(pagination.current, pagination.pageSize);
      if (selectedStaff?.staffId === staffId) {
        setSelectedStaff(prev => ({
          ...prev,
          status: prev.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE',
        }));
      }
    } catch {
      message.error('Thao tác thất bại, vui lòng thử lại');
    }
  };

  // Create staff
  const handleCreate = async (values) => {
    setCreateLoading(true);
    try {
      const payload = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
      };
      await staffApi.createStaff(payload);
      message.success('Thêm nhân viên thành công!');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchStaff(1, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thêm nhân viên thất bại');
    } finally {
      setCreateLoading(false);
    }
  };

  // Open edit modal
  const openEdit = (staff) => {
    setEditModalVisible(true);
    editForm.setFieldsValue({
      fullName: staff.fullName,
      phone: staff.phone,
      specialty: staff.specialty,
      hireDate: staff.hireDate ? dayjs(staff.hireDate) : null,
    });
  };

  // Submit edit
  const handleEdit = async (values) => {
    setEditLoading(true);
    try {
      const payload = {
        username: selectedStaff.username,
        email: selectedStaff.email,
        password: 'placeholder_not_changed',
        fullName: values.fullName,
        phone: values.phone,
        position: selectedStaff.position,
        specialty: values.specialty,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
      };
      const res = await staffApi.updateStaff(selectedStaff.staffId, payload);
      message.success('Cập nhật thông tin thành công!');
      setEditModalVisible(false);
      const updated = res.data.data;
      setSelectedStaff(updated);
      fetchStaff(pagination.current, pagination.pageSize);
    } catch {
      message.error('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setEditLoading(false);
    }
  };

  // Open position modal
  const openPosition = (staff) => {
    setSelectedStaff(staff);
    setPositionModalVisible(true);
    positionForm.setFieldsValue({ position: staff.position });
  };

  // Submit position change
  const handlePositionChange = async (values) => {
    setPositionLoading(true);
    try {
      await staffApi.updatePosition(selectedStaff.staffId, values.position);
      message.success('Phân quyền chức vụ thành công!');
      setPositionModalVisible(false);
      setSelectedStaff(prev => ({ ...prev, position: values.position }));
      fetchStaff(pagination.current, pagination.pageSize);
    } catch {
      message.error('Phân quyền thất bại, vui lòng thử lại');
    } finally {
      setPositionLoading(false);
    }
  };

  // Filtered staff list
  const filteredStaff = search
    ? staffList.filter(s =>
        [s.fullName, s.email, s.phone, s.username].some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : staffList;

  // Main table columns
  const columns = [
    {
      title: 'Nhân viên',
      key: 'info',
      render: (_, r) => (
        <Space>
          <Avatar
            style={{
              background: r.position === 'MANAGER'
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : r.position === 'TECHNICIAN'
                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                : 'linear-gradient(135deg, #059669, #10b981)',
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {r.email}
            </Text>
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
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      render: p => <Tag color={POSITION_COLOR[p] || 'default'}>{POSITION_LABEL[p] || p}</Tag>,
      filters: Object.entries(POSITION_LABEL).map(([k, v]) => ({ text: v, value: k })),
      onFilter: (value, record) => record.position === value,
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialty',
      key: 'specialty',
      render: v => v || <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: d => d ? dayjs(d).format('DD/MM/YYYY') : '—',
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
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} type="primary" ghost
              onClick={() => { setSelectedStaff(r); openEdit(r); }} />
          </Tooltip>
          <Tooltip title="Phân quyền chức vụ">
            <Button size="small" icon={<SafetyCertificateOutlined />}
              style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
              onClick={() => openPosition(r)} />
          </Tooltip>
          <Tooltip title={r.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <Popconfirm
              title={`${r.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản nhân viên này?`}
              onConfirm={() => handleToggleLock(r.staffId, r.status)}
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

  // Ticket columns in drawer
  const ticketColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: c => <Text strong style={{ color: '#7c3aed' }}>{c}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: v => v || '—',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
      render: v => v || '—',
    },
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
            Quản lý Nhân viên
          </Title>
          <Text type="secondary">
            Tổng: <strong>{pagination.total}</strong> nhân viên
          </Text>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Tìm theo tên, email, SĐT..."
              allowClear
              enterButton={<><SearchOutlined /> Tìm</>}
              style={{ width: 300 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onSearch={val => setSearch(val)}
            />
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchStaff(pagination.current, pagination.pageSize)}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}
              onClick={() => { createForm.resetFields(); setCreateModalVisible(true); }}
            >
              Thêm nhân viên
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Summary cards */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {Object.entries(POSITION_LABEL).map(([key, label]) => {
          const count = staffList.filter(s => s.position === key).length;
          return (
            <Col span={8} key={key}>
              <Card size="small" style={{ borderLeft: `4px solid ${key === 'MANAGER' ? '#7c3aed' : key === 'TECHNICIAN' ? '#2563eb' : '#059669'}` }}>
                <Statistic
                  title={label}
                  value={count}
                  valueStyle={{ color: key === 'MANAGER' ? '#7c3aed' : key === 'TECHNICIAN' ? '#2563eb' : '#059669', fontSize: 20 }}
                  prefix={<IdcardOutlined />}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Table */}
      <Table
        dataSource={filteredStaff}
        columns={columns}
        rowKey="staffId"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân viên`,
          onChange: (page, pageSize) => fetchStaff(page, pageSize),
        }}
        scroll={{ x: 900 }}
      />

      {/* ==================== DETAIL DRAWER ==================== */}
      <Drawer
        title={
          <Space>
            <Avatar
              size={38}
              style={{
                background: selectedStaff?.position === 'MANAGER'
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : selectedStaff?.position === 'TECHNICIAN'
                  ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                  : 'linear-gradient(135deg, #059669, #10b981)',
              }}
              icon={<UserOutlined />}
            />
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{selectedStaff?.fullName}</div>
              <Tag color={POSITION_COLOR[selectedStaff?.position]} style={{ fontSize: 11 }}>
                {POSITION_LABEL[selectedStaff?.position]}
              </Tag>
            </div>
          </Space>
        }
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} type="primary" ghost onClick={() => openEdit(selectedStaff)}>
              Chỉnh sửa
            </Button>
            <Button icon={<SafetyCertificateOutlined />}
              style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
              onClick={() => { setPositionModalVisible(true); positionForm.setFieldsValue({ position: selectedStaff?.position }); }}>
              Phân quyền
            </Button>
            <Popconfirm
              title={`${selectedStaff?.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản này?`}
              onConfirm={() => handleToggleLock(selectedStaff?.staffId, selectedStaff?.status)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                icon={selectedStaff?.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
                danger={selectedStaff?.status === 'ACTIVE'}
                type={selectedStaff?.status === 'LOCKED' ? 'primary' : 'default'}
              >
                {selectedStaff?.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {selectedStaff && (
          <Tabs defaultActiveKey="profile">
            <TabPane tab={<span><UserOutlined />Hồ sơ nhân viên</span>} key="profile">
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', background: '#f8f6ff', border: '1px solid #e9d5ff' }}>
                    <Avatar
                      size={64}
                      style={{
                        background: selectedStaff.position === 'MANAGER'
                          ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                          : selectedStaff.position === 'TECHNICIAN'
                          ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                          : 'linear-gradient(135deg, #059669, #10b981)',
                        marginBottom: 8,
                      }}
                      icon={<UserOutlined />}
                    />
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedStaff.fullName}</div>
                    <Tag color={POSITION_COLOR[selectedStaff.position]}>
                      {POSITION_LABEL[selectedStaff.position]}
                    </Tag>
                    <div style={{ marginTop: 8 }}>
                      <Badge
                        status={selectedStaff.status === 'ACTIVE' ? 'success' : 'error'}
                        text={selectedStaff.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={16}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic
                        title="Tổng phiếu phụ trách"
                        value={ticketPagination.total}
                        prefix={<HistoryOutlined />}
                        valueStyle={{ color: '#7c3aed' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Phiếu đang xử lý"
                        value={staffTickets.filter(t => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(t.status)).length}
                        prefix={<ToolOutlined />}
                        valueStyle={{ color: '#2563eb' }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0' }} />

              <Descriptions column={1} bordered size="small" labelStyle={{ width: 160 }}>
                <Descriptions.Item label={<><IdcardOutlined /> Username</>}>
                  {selectedStaff.username}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {selectedStaff.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                  {selectedStaff.phone || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={<><SafetyCertificateOutlined /> Chức vụ</>}>
                  <Tag color={POSITION_COLOR[selectedStaff.position]}>
                    {POSITION_LABEL[selectedStaff.position]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<><ToolOutlined /> Chuyên môn</>}>
                  {selectedStaff.specialty || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày vào làm</>}>
                  {selectedStaff.hireDate ? dayjs(selectedStaff.hireDate).format('DD/MM/YYYY') : '—'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane
              tab={<span><HistoryOutlined />Phiếu sửa chữa ({ticketPagination.total})</span>}
              key="tickets"
            >
              <Table
                dataSource={staffTickets}
                columns={ticketColumns}
                rowKey="ticketId"
                size="small"
                loading={ticketsLoading}
                pagination={{
                  current: ticketPagination.current,
                  pageSize: ticketPagination.pageSize,
                  total: ticketPagination.total,
                  showTotal: total => `${total} phiếu`,
                  onChange: (page, pageSize) => fetchStaffTickets(selectedStaff.staffId, page, pageSize),
                }}
                locale={{ emptyText: 'Nhân viên chưa được phân công phiếu nào' }}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* ==================== CREATE MODAL ==================== */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#7c3aed' }} />
            Thêm nhân viên mới
          </Space>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Mật khẩu mặc định sẽ được thiết lập khi tạo tài khoản. Nhân viên nên đổi mật khẩu sau khi đăng nhập lần đầu."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="username" label="Tên đăng nhập"
                rules={[{ required: true, message: 'Nhập tên đăng nhập' }, { min: 3, message: 'Tối thiểu 3 ký tự' }]}>
                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email"
                rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên"
                rules={[{ required: true, message: 'Nhập họ tên' }]}>
                <Input placeholder="Họ và tên đầy đủ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="password" label="Mật khẩu"
                rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 8, message: 'Tối thiểu 8 ký tự' }]}>
                <Input.Password placeholder="Mật khẩu (tối thiểu 8 ký tự)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Chức vụ"
                rules={[{ required: true, message: 'Chọn chức vụ' }]}>
                <Select placeholder="Chọn chức vụ">
                  <Option value="TECHNICIAN">Kỹ thuật viên</Option>
                  <Option value="RECEPTIONIST">Lễ tân</Option>
                  <Option value="MANAGER">Quản lý</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="specialty" label="Chuyên môn">
                <Input prefix={<ToolOutlined />} placeholder="VD: Điện thoại, Laptop..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hireDate" label="Ngày vào làm">
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                <CheckCircleOutlined /> Tạo nhân viên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ==================== EDIT MODAL ==================== */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#7c3aed' }} />
            Cập nhật thông tin: {selectedStaff?.fullName}
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label="Họ và tên"
            rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input placeholder="Họ và tên đầy đủ" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item name="specialty" label="Chuyên môn">
            <Input prefix={<ToolOutlined />} placeholder="VD: Điện thoại, Laptop..." />
          </Form.Item>
          <Form.Item name="hireDate" label="Ngày vào làm">
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
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

      {/* ==================== POSITION MODAL ==================== */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#7c3aed' }} />
            Phân quyền chức vụ: {selectedStaff?.fullName}
          </Space>
        }
        open={positionModalVisible}
        onCancel={() => setPositionModalVisible(false)}
        footer={null}
        width={400}
      >
        <Alert
          message="Thay đổi chức vụ sẽ ảnh hưởng đến quyền hạn và nhiệm vụ của nhân viên trong hệ thống."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={positionForm} layout="vertical" onFinish={handlePositionChange}>
          <Form.Item name="position" label="Chức vụ mới"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}>
            <Select size="large" placeholder="Chọn chức vụ">
              <Option value="TECHNICIAN">
                <Tag color="blue">Kỹ thuật viên</Tag> — Sửa chữa, chẩn đoán thiết bị
              </Option>
              <Option value="RECEPTIONIST">
                <Tag color="green">Lễ tân</Tag> — Tiếp nhận, tư vấn khách hàng
              </Option>
              <Option value="MANAGER">
                <Tag color="purple">Quản lý</Tag> — Quản lý vận hành toàn bộ
              </Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setPositionModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={positionLoading}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none' }}>
                <CheckCircleOutlined /> Xác nhận phân quyền
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
