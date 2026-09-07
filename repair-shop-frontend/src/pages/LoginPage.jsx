import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      message.success('Đăng nhập thành công!');
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'STAFF') navigate('/staff');
      else navigate('/customer');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
        <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>🔧 RepairShop</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>Hệ thống quản lý cửa hàng sửa chữa chuyên nghiệp</p>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: 400 }} className="glass-card">
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng Nhập</h2>
          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                Đăng Nhập
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              Chưa có tài khoản? <Link to="/register" className="gradient-text">Đăng ký ngay</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
