import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register({ ...values, role: 'CUSTOMER' });
      message.success('Đăng ký thành công!');
      navigate('/customer-new');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', justifyContent: 'center', alignItems: 'center' }}>
      <Card style={{ width: 500 }} className="glass-card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }} className="gradient-text">Đăng Ký Tài Khoản</h2>
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" size="large" />
          </Form.Item>
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item name="confirmPassword" dependencies={['password']} rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
              Đăng Ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login" className="gradient-text">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
