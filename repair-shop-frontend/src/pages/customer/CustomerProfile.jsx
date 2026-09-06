import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { customerApi } from '../../api/customerApi';
import { authApi } from '../../api/authApi';

export default function CustomerProfile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.me().then(res => form.setFieldsValue(res.data.data)).catch(() => {});
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await customerApi.updateProfile(values);
      message.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      message.error('Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<span style={{color:'white'}}>Thông tin cá nhân</span>} className="glass-card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="address" label="Địa chỉ"><Input.TextArea /></Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>Lưu thay đổi</Button>
      </Form>
    </Card>
  );
}
