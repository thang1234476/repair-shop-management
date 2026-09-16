import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Modal, message, Space, Divider } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, LaptopOutlined } from '@ant-design/icons';
import { ticketApi } from '../../api/ticketApi';
import { customerApi } from '../../api/customerApi';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function StaffCreateTicket() {
  const [form] = Form.useForm();
  const [deviceForm] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [creatingDevice, setCreatingDevice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomers({ size: 100 });
      setCustomers(res.data?.data?.content || []);
    } catch {
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDevices = async (customerId) => {
    try {
      const res = await customerApi.getStaffCustomerDevices(customerId);
      setDevices(res.data?.data || []);
    } catch {
      setDevices([]);
    }
  };

  const onCustomerChange = async (customerId) => {
    setSelectedCustomerId(customerId);
    form.setFieldsValue({ deviceId: undefined });
    if (customerId) {
      await fetchCustomerDevices(customerId);
    } else {
      setDevices([]);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        customerId: values.customerId,
        deviceId: values.deviceId,
        issueDescription: values.issueDescription,
      };
      const res = await ticketApi.createTicket(payload);
      const ticketId = res.data?.data?.ticketId || res.data?.data?.id;
      message.success('Tạo phiếu sửa chữa thành công!');
      navigate(`/staff/tickets/${ticketId}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tạo phiếu sửa chữa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDevice = async (values) => {
    if (!selectedCustomerId) {
      message.warning('Vui lòng chọn khách hàng trước khi thêm thiết bị');
      return;
    }
    setCreatingDevice(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        deviceType: values.deviceType,
        brand: values.brand,
        model: values.model,
        serialNumber: values.serialNumber,
        imei: values.imei,
        initialCondition: values.initialCondition,
      };
      const res = await customerApi.createStaffDevice(payload);
      const newDev = res.data?.data;
      message.success('Thêm thiết bị mới thành công!');
      setDeviceModalOpen(false);
      deviceForm.resetFields();
      await fetchCustomerDevices(selectedCustomerId);
      if (newDev?.deviceId) {
        form.setFieldsValue({ deviceId: newDev.deviceId });
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi thêm thiết bị');
    } finally {
      setCreatingDevice(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/staff/tickets')}>
          Quay lại
        </Button>
        <h2 style={{ margin: 0, color: 'white' }}>Tạo phiếu sửa chữa mới</h2>
      </div>

      <Card className="glass-card">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="customerId"
            label={<span style={{ color: '#e2e8f0', fontWeight: 500 }}>Khách hàng</span>}
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm khách hàng theo tên hoặc SĐT..."
              optionFilterProp="children"
              onChange={onCustomerChange}
              size="large"
              loading={loading}
            >
              {customers.map((c) => (
                <Option key={c.customerId || c.id} value={c.customerId || c.id}>
                  {c.fullName} — {c.phone} {c.email ? `(${c.email})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deviceId"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>Thiết bị sửa chữa</span>
                {selectedCustomerId && (
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setDeviceModalOpen(true)}
                    style={{ color: '#a78bfa', padding: 0 }}
                  >
                    + Thêm thiết bị mới cho khách này
                  </Button>
                )}
              </div>
            }
            rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
          >
            <Select
              placeholder={selectedCustomerId ? 'Chọn thiết bị cần sửa chữa' : 'Vui lòng chọn khách hàng trước'}
              size="large"
              disabled={!selectedCustomerId}
            >
              {devices.map((d) => (
                <Option key={d.deviceId || d.id} value={d.deviceId || d.id}>
                  {d.brand} {d.model} {d.deviceType ? `[${d.deviceType}]` : ''} {d.serialNumber ? `(S/N: ${d.serialNumber})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="issueDescription"
            label={<span style={{ color: '#e2e8f0', fontWeight: 500 }}>Mô tả lỗi / Yêu cầu của khách</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mô tả lỗi' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Chi tiết tình trạng máy lúc tiếp nhận, hiện tượng lỗi khách mô tả..."
            />
          </Form.Item>

          <Divider style={{ borderColor: '#2d2b52' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => navigate('/staff/tickets')}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Tiếp nhận & Tạo phiếu
            </Button>
          </div>
        </Form>
      </Card>

      {/* Modal Thêm thiết bị mới cho khách */}
      <Modal
        title="Thêm thiết bị mới cho khách hàng"
        open={deviceModalOpen}
        onCancel={() => setDeviceModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={deviceForm} layout="vertical" onFinish={handleCreateDevice}>
          <Form.Item
            name="deviceType"
            label="Loại thiết bị"
            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập loại thiết bị' }]}
          >
            <Select placeholder="Chọn loại thiết bị">
              <Option value="Laptop">Laptop / Máy tính xách tay</Option>
              <Option value="Điện thoại">Điện thoại di động</Option>
              <Option value="PC">Máy tính để bàn / Desktop</Option>
              <Option value="Tablet">Máy tính bảng / iPad</Option>
              <Option value="Khác">Thiết bị khác</Option>
            </Select>
          </Form.Item>

          <Form.Item name="brand" label="Hãng sản xuất" rules={[{ required: true, message: 'Vui lòng nhập hãng' }]}>
            <Input placeholder="Apple, Dell, Asus, HP, Samsung..." />
          </Form.Item>

          <Form.Item name="model" label="Model / Dòng máy" rules={[{ required: true, message: 'Vui lòng nhập model' }]}>
            <Input placeholder="MacBook Pro M1 2021, ThinkPad T14..." />
          </Form.Item>

          <Form.Item name="serialNumber" label="Số Serial (S/N)">
            <Input placeholder="Nhập số Serial của máy" />
          </Form.Item>

          <Form.Item name="imei" label="IMEI (Nếu có)">
            <Input placeholder="Nhập IMEI" />
          </Form.Item>

          <Form.Item name="initialCondition" label="Tình trạng ban đầu lúc nhận">
            <Input.TextArea rows={2} placeholder="Trầy xước nhẹ nắp lưng, màn hình có dán bảo vệ..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setDeviceModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creatingDevice}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Lưu thiết bị
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
