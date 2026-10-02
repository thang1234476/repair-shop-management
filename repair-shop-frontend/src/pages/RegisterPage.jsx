import React, { useState } from 'react';
import { Form, Input, Button, message, ConfigProvider, theme, Row, Col } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  UserAddOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/public-landing.css';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register({ ...values, role: 'CUSTOMER' });
      message.success('Đăng ký tài khoản thành công!');
      navigate('/customer');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          colorBgContainer: '#ffffff',
          borderRadius: 10,
        },
      }}
    >
      <div
        className="public-root role-page-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '36px 16px',
          background: '#f8fafc',
        }}
      >
        {/* Back Link */}
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}>
          <span
            onClick={() => navigate('/login/customer')}
            style={{
              color: '#64748b',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </span>
        </div>

        {/* Register Box */}
        <div className="role-login-card" style={{ maxWidth: 480, padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                marginBottom: 16,
              }}
            >
              <UserAddOutlined />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Đăng ký tài khoản
            </h2>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
              Khách Hàng
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 6, margin: 0 }}>
              Đăng ký để theo dõi tiến độ thiết bị & nhận báo giá sửa chữa
            </p>
          </div>

          <Form form={form} name="register" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input
                prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập họ và tên của bạn"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Tên đăng nhập</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự!' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ gồm chữ cái, số và dấu gạch dưới!' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Chọn tên đăng nhập (ví dụ: nguyenvana)"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Địa chỉ email không đúng định dạng!' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập email của bạn (để nhận mã OTP và thông báo)"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Số điện thoại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9+ ]{9,15}$/, message: 'Số điện thoại không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập số điện thoại liên hệ"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Tối thiểu 6 ký tự!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                    placeholder="Mật khẩu"
                    size="large"
                    style={{ height: 46 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="confirmPassword"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Xác nhận</span>}
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                    placeholder="Nhập lại"
                    size="large"
                    style={{ height: 46 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 8, marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  background: '#4f46e5',
                  borderColor: '#4f46e5',
                  height: 48,
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 10,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                }}
              >
                Đăng Ký Tài Khoản
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: '#64748b' }}>
              Đã có tài khoản khách hàng?{' '}
              <Link to="/login/customer" style={{ color: '#4f46e5', fontWeight: 700 }}>
                Đăng nhập ngay
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}
