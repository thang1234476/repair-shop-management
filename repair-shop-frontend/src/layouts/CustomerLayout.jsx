import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, MobileOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const { Header, Sider, Content } = Layout;

export default function CustomerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/customer', icon: <HomeOutlined />, label: 'Bảng điều khiển' },
    { key: '/customer/tickets', icon: <FileTextOutlined />, label: 'Phiếu sửa chữa' },
    { key: '/customer/devices', icon: <MobileOutlined />, label: 'Thiết bị của tôi' },
    { key: '/customer/notifications', icon: <Badge count={unreadCount} size="small"><BellOutlined /></Badge>, label: 'Thông báo' },
    { key: '/customer/profile', icon: <UserOutlined />, label: 'Tài khoản' },
  ];

  const profileMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', onClick: () => navigate('/customer/profile') },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={250}>
        <div className="sidebar-logo">
          <h2 className="gradient-text" style={{ margin: 0 }}>{collapsed ? '🔧' : '🔧 RepairShop'}</h2>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={profileMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: 'white' }}>{user?.fullName}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: 24, minHeight: 280, borderRadius: 8 }} className="glass-card">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
