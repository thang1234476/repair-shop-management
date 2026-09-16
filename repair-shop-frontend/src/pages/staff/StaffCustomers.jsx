import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, DatePicker, Space, Card, Tag, Drawer, List, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, ReloadOutlined, LaptopOutlined } from '@ant-design/icons';
import { customerApi } from '../../api/customerApi';
import { formatDate } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Option } = Select;

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [devicesDrawerOpen, setDevicesDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDevices, setCustomerDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (p = page, s = pageSize, q = search) => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomers({
        search: q || undefined,
        page: p,
        size: s,
      });
      const data = res.data?.data;
      setCustomers(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch {
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, pageSize, search);
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(0);
    fetchCustomers(0, pageSize, search);
  };

  // Open Edit Modal
  const openEditModal = (record) => {
    setSelectedCustomer(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      address: record.address,
      gender: record.gender,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      note: record.note,
    });
    setEditModalOpen(true);
  };

  // Open Devices Drawer
  const openDevicesDrawer = async (record) => {
    setSelectedCustomer(record);
    setDevicesDrawerOpen(true);
    setDevicesLoading(true);
    try {
      const id = record.customerId || record.id;
      const res = await customerApi.getStaffCustomerDevices(id);
      setCustomerDevices(res.data?.data || []);
    } catch {
      setCustomerDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  // Submit Create Customer
  const handleCreateCustomer = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        gender: values.gender,
        note: values.note,
      };
      await customerApi.createCustomer(payload);
      message.success('Thêm khách hàng mới thành công!');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchCustomers(0, pageSize, search);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tạo khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Customer
  const handleEditCustomer = async (values) => {
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const id = selectedCustomer.customerId || selectedCustomer.id;
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender,
        note: values.note,
      };
      await customerApi.updateCustomer(id, payload);
      message.success('Cập nhật thông tin khách hàng thành công!');
      setEditModalOpen(false);
      fetchCustomers(page, pageSize, search);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 90,
      render: (id) => <span style={{ color: '#a78bfa', fontWeight: 600 }}>#{id}</span>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <span style={{ fontWeight: 600, color: '#fff' }}>{name}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '—',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '—',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (addr) => addr || '—',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (g) => {
        if (g === 'MALE') return <Tag color="blue">Nam</Tag>;
        if (g === 'FEMALE') return <Tag color="magenta">Nữ</Tag>;
        if (g === 'OTHER') return <Tag color="default">Khác</Tag>;
        return '—';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s) => (
        <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>
          {s === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            icon={<LaptopOutlined />}
            onClick={() => openDevicesDrawer(record)}
            style={{ color: '#a78bfa', borderColor: '#7c3aed' }}
          >
            Thiết bị
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: 'white' }}>Quản lý khách hàng</h2>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Hồ sơ khách hàng, liên hệ và thiết bị liên kết</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            createForm.resetFields();
            setCreateModalOpen(true);
          }}
          style={{ background: '#7c3aed', borderColor: '#7c3aed', height: 40, borderRadius: 8 }}
        >
          Thêm khách hàng mới
        </Button>
      </div>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 320 }}
              allowClear
            />
            <Button type="primary" onClick={handleSearch} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
              Tìm kiếm
            </Button>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCustomers(page, pageSize, search)}>
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          dataSource={customers}
          columns={columns}
          rowKey={(r) => r.customerId || r.id}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize,
            total: totalElements,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
            },
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
          }}
        />
      </Card>

      {/* Modal Thêm khách hàng mới */}
      <Modal
        title="Thêm hồ sơ khách hàng mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateCustomer}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="username"
              label="Tên đăng nhập (Username)"
              rules={[
                { required: true, message: 'Vui lòng nhập username' },
                { min: 3, message: 'Tối thiểu 3 ký tự' },
              ]}
            >
              <Input placeholder="nguyenvana" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu ban đầu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 8, message: 'Tối thiểu 8 ký tự' },
              ]}
            >
              <Input.Password placeholder="Mật khẩu đăng nhập" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item name="phone" label="Số điện thoại">
              <Input placeholder="0901234567" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính" allowClear>
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Quận/Huyện, Tỉnh/TP" />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú về khách hàng..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Lưu khách hàng
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Sửa thông tin khách hàng */}
      <Modal
        title={`Chỉnh sửa thông tin khách hàng: ${selectedCustomer?.fullName || ''}`}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditCustomer}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính" allowClear>
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="dateOfBirth" label="Ngày sinh">
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Xem danh sách thiết bị của khách */}
      <Drawer
        title={`Thiết bị của khách: ${selectedCustomer?.fullName || ''}`}
        open={devicesDrawerOpen}
        onClose={() => setDevicesDrawerOpen(false)}
        width={480}
      >
        <List
          loading={devicesLoading}
          dataSource={customerDevices}
          locale={{ emptyText: 'Khách hàng này chưa có thiết bị nào' }}
          renderItem={(d) => (
            <List.Item key={d.deviceId || d.id}>
              <List.Item.Meta
                avatar={<LaptopOutlined style={{ fontSize: 24, color: '#7c3aed' }} />}
                title={
                  <span>
                    {d.brand} {d.model} <Tag color="purple">{d.deviceType || 'Thiết bị'}</Tag>
                  </span>
                }
                description={
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>
                    {d.serialNumber && <div>Số Serial: <b>{d.serialNumber}</b></div>}
                    {d.imei && <div>IMEI: {d.imei}</div>}
                    {d.initialCondition && <div>Tình trạng ban đầu: {d.initialCondition}</div>}
                    <div style={{ marginTop: 4, fontSize: 11 }}>Ngày tạo: {formatDate(d.createdAt)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}
