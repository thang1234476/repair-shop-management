import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, ConfigProvider, theme } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ToolOutlined,
  CrownOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import '../../styles/public-landing.css';

const ROLE_META = {
  customer: {
    title: 'Khách Hàng',
    icon: <UserOutlined />,
    color: '#4f46e5',
    bgLight: '#eef2ff',
    expectedRole: 'CUSTOMER',
    sub: 'Đăng nhập để theo dõi thiết bị & xem báo giá',
    defaultRoute: '/customer-new',
  },
  staff: {
    title: 'Nhân Viên / Kỹ Thuật',
    icon: <ToolOutlined />,
    color: '#0891b2',
    bgLight: '#ecfeff',
    expectedRole: 'STAFF',
    sub: 'Đăng nhập vào cổng tiếp nhận & xử lý kỹ thuật',
    defaultRoute: '/staff',
  },
  admin: {
    title: 'Quản Trị Viên',
    icon: <CrownOutlined />,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    expectedRole: 'ADMIN',
    sub: 'Đăng nhập vào hệ thống quản lý & cấu hình',
    defaultRoute: '/admin',
  },
};

export default function RoleLoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[role?.toLowerCase()] || ROLE_META.customer;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      message.success(`Đăng nhập thành công! Xin chào ${user.fullName || user.username}`);

      // Route based on authenticated user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STAFF') {
        navigate('/staff');
      } else {
        // Customer: default to modern UI
        navigate('/customer-new');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: meta.color,
          colorBgContainer: '#ffffff',
          borderRadius: 10,
        },
      }}
    >
      <div className="public-root role-page-container">
        {/* Back Link */}
        <div style={{ width: '100%', maxWidth: 440, marginBottom: 16 }}>
          <span
            onClick={() => navigate('/login')}
            style={{
              color: '#64748b', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
            }}
          >
            <ArrowLeftOutlined /> Quay lại chọn vai trò
          </span>
        </div>

        {/* Login Box */}
        <div className="role-login-card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: meta.bgLight, color: meta.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 16
            }}>
              {meta.icon}
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Đăng nhập với tư cách
            </h2>
            <div style={{ fontSize: 20, fontWeight: 800, color: meta.color, marginTop: 4 }}>
              {meta.title}
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 6, margin: 0 }}>
              {meta.sub}
            </p>
          </div>

          <Form name="role_login" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Email</span>}
              rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập email của bạn"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Nhập mật khẩu"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#64748b', fontSize: 13 }}>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <span style={{ fontSize: 13, color: meta.color, cursor: 'pointer', fontWeight: 500 }}>
                Quên mật khẩu?
              </span>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  background: meta.color,
                  borderColor: meta.color,
                  height: 48,
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 10,
                  boxShadow: `0 4px 14px ${meta.color}40`,
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>

            {role?.toLowerCase() === 'customer' && (
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#64748b' }}>
                Chưa có tài khoản khách hàng?{' '}
                <Link to="/register" style={{ color: meta.color, fontWeight: 700 }}>
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}
