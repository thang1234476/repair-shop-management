import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, TeamOutlined, UsergroupAddOutlined, FileTextOutlined, AppstoreOutlined, ContainerOutlined, NotificationOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/staff', icon: <TeamOutlined />, label: 'Nhân viên' },
    { key: '/admin/customers', icon: <UsergroupAddOutlined />, label: 'Khách hàng' },
    { key: '/admin/tickets', icon: <FileTextOutlined />, label: 'Phiếu sửa chữa' },
    { key: '/admin/inventory', icon: <AppstoreOutlined />, label: 'Kho linh kiện' },
    { key: '/admin/invoices', icon: <ContainerOutlined />, label: 'Hóa đơn' }
  ];

  const profileMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={250}>
        <div className="sidebar-logo">
          <h2 className="gradient-text" style={{ margin: 0 }}>{collapsed ? '👑' : '👑 Quản Trị'}</h2>
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
