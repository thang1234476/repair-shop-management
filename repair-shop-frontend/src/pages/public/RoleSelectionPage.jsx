import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import {
  UserOutlined,
  ToolOutlined,
  CrownOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import '../../styles/public-landing.css';

const ROLES = [
  {
    key: 'customer',
    name: 'Khách Hàng',
    icon: <UserOutlined />,
    desc: 'Theo dõi tiến trình sửa chữa máy tính & điện thoại, xem báo giá chi tiết, phê duyệt linh kiện và tra cứu lịch sử sửa chữa.',
    btnText: 'Đăng nhập với tư cách Khách hàng',
    route: '/login/customer',
    className: 'role-customer',
  },
  {
    key: 'staff',
    name: 'Nhân Viên / Kỹ Thuật',
    icon: <ToolOutlined />,
    desc: 'Lập phiếu tiếp nhận thiết bị, cập nhật tình trạng kiểm tra vi mạch, lập báo giá sửa chữa và xử lý kho linh kiện thay thế.',
    btnText: 'Đăng nhập với tư cách Nhân viên',
    route: '/login/staff',
    className: 'role-staff',
  },
  {
    key: 'admin',
    name: 'Quản Trị Viên',
    icon: <CrownOutlined />,
    desc: 'Quản lý toàn bộ hệ thống cửa hàng, nhân sự kỹ thuật, danh mục khách hàng, báo cáo doanh thu & hóa đơn dịch vụ.',
    btnText: 'Đăng nhập với tư cách Quản trị viên',
    route: '/login/admin',
    className: 'role-admin',
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: '#4f46e5' } }}>
      <div className="public-root role-page-container">
        <div className="role-select-box">
          {/* Back to Home Link */}
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <span
              onClick={() => navigate('/')}
              style={{
                color: '#64748b', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              <ArrowLeftOutlined /> Quay về trang chủ
            </span>
          </div>

          {/* Header */}
          <div className="role-header">
            <div className="role-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <div className="pub-logo-badge" style={{ width: 44, height: 44, fontSize: 22 }}>
                <ToolOutlined />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                Repair<span style={{ color: '#4f46e5' }}>Shop</span>
              </span>
            </div>

            <h2 className="role-title">Đăng Nhập Vào Hệ Thống</h2>
            <p className="role-sub">
              Vui lòng chọn vai trò phù hợp của bạn để tiếp tục truy cập cổng thông tin tương ứng
            </p>
          </div>

          {/* 3 Role Cards */}
          <div className="role-cards-grid">
            {ROLES.map((role) => (
              <div
                key={role.key}
                className={`role-card ${role.className}`}
                onClick={() => navigate(role.route)}
              >
                <div className="role-icon-box">
                  {role.icon}
                </div>

                <h3 className="role-card-name">{role.name}</h3>
                <p className="role-card-desc">{role.desc}</p>

                <button className="role-card-btn">
                  {role.btnText} <ArrowRightOutlined style={{ fontSize: 12, marginLeft: 4 }} />
                </button>
              </div>
            ))}
          </div>

          {/* Customer register tip */}
          <div style={{ textAlign: 'center', marginTop: 36, color: '#64748b', fontSize: 14 }}>
            Khách hàng mới chưa có tài khoản?{' '}
            <span
              onClick={() => navigate('/register')}
              style={{ color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}
            >
              Đăng ký tài khoản ngay
            </span>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
