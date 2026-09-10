import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme, Badge, Avatar, Dropdown, Drawer } from 'antd';
import {
  HomeOutlined, FileTextOutlined, MobileOutlined,
  BellOutlined, UserOutlined, LogoutOutlined,
  MenuOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/modern-customer.css';

const MODERN_THEME = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4f46e5',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 38,
      paddingContentHorizontal: 18,
      fontWeight: 500,
    },
    Input: { borderRadius: 10, controlHeight: 40 },
    Select: { borderRadius: 10, controlHeight: 40 },
    Card: { borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' },
    Steps: {
      colorPrimary: '#4f46e5',
      iconSize: 28,
    },
    Timeline: { dotBorderWidth: 2 },
    Badge: { colorError: '#ef4444' },
    Tag: { borderRadius: 100 },
    Modal: { borderRadius: 16 },
    Drawer: { colorBgContainer: '#ffffff' },
  },
};

const NAV_ITEMS = [
  { key: '/customer-new',               icon: <HomeOutlined />,     label: 'Tổng quan' },
  { key: '/customer-new/tickets',       icon: <FileTextOutlined />, label: 'Phiếu sửa chữa' },
  { key: '/customer-new/devices',       icon: <MobileOutlined />,   label: 'Thiết bị của tôi' },
  { key: '/customer-new/notifications', icon: <BellOutlined />,     label: 'Thông báo' },
];

export default function CustomerModernLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileMenu = {
    items: [
      {
        key: 'profile',
        icon: <SettingOutlined />,
        label: 'Tài khoản',
        onClick: () => navigate('/customer-new/profile'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  const isActive = (key) => {
    if (key === '/customer-new') return location.pathname === '/customer-new';
    return location.pathname.startsWith(key);
  };

  return (
    <ConfigProvider theme={MODERN_THEME}>
      <div className="modern-customer-root mc-layout">
        {/* ── Header ── */}
        <header className="mc-header">
          <div className="mc-content-wrapper" style={{ width: '100%' }}>
            <div className="mc-header-inner">
              {/* Logo */}
              <div className="mc-logo" onClick={() => navigate('/customer-new')}>
                <div className="mc-logo-icon">🔧</div>
                <span className="mc-logo-text">RepairShop</span>
              </div>

              {/* Desktop Nav */}
              <nav className="mc-nav">
                {NAV_ITEMS.map(item => (
                  <div
                    key={item.key}
                    className={`mc-nav-link${isActive(item.key) ? ' active' : ''}`}
                    onClick={() => navigate(item.key)}
                  >
                    {item.key === '/customer-new/notifications'
                      ? <Badge count={unreadCount} size="small" offset={[4, -2]}>{item.icon}</Badge>
                      : item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="mc-header-actions">
                {/* Mobile notification badge */}
                <Badge count={unreadCount} size="small" style={{ display: 'none' }}>
                  <button
                    className="mc-notif-btn"
                    style={{ display: 'flex' }}
                    onClick={() => navigate('/customer-new/notifications')}
                  >
                    <BellOutlined />
                  </button>
                </Badge>

                {/* Profile Dropdown */}
                <Dropdown menu={profileMenu} placement="bottomRight" trigger={['click']}>
                  <div className="mc-user-btn">
                    <Avatar
                      size={30}
                      icon={<UserOutlined />}
                      style={{ background: '#4f46e5', flexShrink: 0 }}
                    />
                    <span className="mc-user-name">{user?.fullName}</span>
                  </div>
                </Dropdown>

                {/* Mobile Hamburger */}
                <button
                  className="mc-mobile-menu-btn"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuOutlined />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Mobile Drawer ── */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>🔧</div>
              <span style={{ fontWeight: 700, color: '#111827' }}>RepairShop</span>
            </div>
          }
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
        >
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: '#eef2ff', borderRadius: 12 }}>
            <Avatar size={44} icon={<UserOutlined />} style={{ background: '#4f46e5', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Khách hàng</div>
            </div>
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`mc-nav-link${isActive(item.key) ? ' active' : ''}`}
              style={{ width: '100%', marginBottom: 4, padding: '12px 16px', borderRadius: 10 }}
              onClick={() => { navigate(item.key); setDrawerOpen(false); }}
            >
              {item.key === '/customer-new/notifications'
                ? <Badge count={unreadCount} size="small">{item.icon}</Badge>
                : item.icon}
              <span style={{ fontSize: 15 }}>{item.label}</span>
            </div>
          ))}

          <div style={{ height: 1, background: '#e5e7eb', margin: '16px 0' }} />

          <div
            className="mc-nav-link"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10 }}
            onClick={() => { navigate('/customer-new/profile'); setDrawerOpen(false); }}
          >
            <SettingOutlined />
            <span style={{ fontSize: 15 }}>Tài khoản</span>
          </div>

          <div
            className="mc-nav-link"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, color: '#ef4444' }}
            onClick={handleLogout}
          >
            <LogoutOutlined />
            <span style={{ fontSize: 15 }}>Đăng xuất</span>
          </div>
        </Drawer>

        {/* ── Main Content ── */}
        <main>
          <div className="mc-content-wrapper">
            <div className="mc-page">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
