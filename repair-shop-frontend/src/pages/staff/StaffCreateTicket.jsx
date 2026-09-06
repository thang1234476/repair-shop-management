import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { ticketApi } from '../../api/ticketApi';
import { customerApi } from '../../api/customerApi';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export default function StaffCreateTicket() {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.getCustomers({ size: 100 });
      setCustomers(res.data.data.content);
    } catch (error) {}
  };

  const onCustomerChange = async (customerId) => {
    try {
      const res = await customerApi.getAdminCustomer(customerId);
      setDevices(res.data.data.devices || []);
      form.setFieldsValue({ deviceId: undefined });
    } catch (error) {}
  };

  const onFinish = async (values) => {
    try {
      const res = await ticketApi.createTicket(values);
      message.success('Tạo phiếu thành công');
      navigate(`/staff/tickets/${res.data.data.id}`);
    } catch (error) {
      message.error('Lỗi tạo phiếu');
    }
  };

  return (
    <Card title={<span style={{color:'white'}}>Tạo phiếu sửa chữa mới</span>} className="glass-card" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="children" onChange={onCustomerChange}>
            {customers.map(c => <Option key={c.id} value={c.id}>{c.fullName} - {c.phone}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="deviceId" label="Thiết bị" rules={[{ required: true }]}>
          <Select>
            {devices.map(d => <Option key={d.id} value={d.id}>{d.brand} {d.model} ({d.serialNumber})</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="issueDescription" label="Mô tả lỗi" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="estimatedCost" label="Phí dự kiến (Tham khảo)">
          <Input type="number" />
        </Form.Item>
        <Button type="primary" htmlType="submit">Tạo phiếu</Button>
      </Form>
    </Card>
  );
}
