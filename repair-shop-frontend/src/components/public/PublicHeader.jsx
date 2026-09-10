import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Button } from 'antd';
import {
  ToolOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  CloseOutlined
} from '@ant-design/icons';

export default function PublicHeader({ onOpenBooking, onScrollToSection }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="pub-header">
      <div className="pub-container">
        <div className="pub-header-inner">
          {/* Logo */}
          <div className="pub-logo" onClick={() => navigate('/')}>
            <div className="pub-logo-badge">
              <ToolOutlined />
            </div>
            <span className="pub-logo-title">
              Repair<span>Shop</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="pub-nav">
            <span className="pub-nav-item" onClick={() => handleNavClick('hero')}>
              Trang chủ
            </span>
            <span className="pub-nav-item" onClick={() => handleNavClick('services')}>
              Dịch vụ
            </span>
            <span className="pub-nav-item" onClick={() => handleNavClick('process')}>
              Quy trình
            </span>
            <span className="pub-nav-item" onClick={() => handleNavClick('why-us')}>
              Về chúng tôi
            </span>
            <span className="pub-nav-item" onClick={() => handleNavClick('footer')}>
              Liên hệ
            </span>
          </nav>

          {/* Actions */}
          <div className="pub-header-actions">
            <button
              className="pub-btn pub-btn-secondary"
              onClick={() => handleNavClick('track-ticket')}
              style={{ display: 'none', md: 'inline-flex' }}
            >
              <SearchOutlined /> Tra cứu phiếu
            </button>

            <button
              className="pub-btn pub-btn-outline"
              onClick={() => navigate('/login')}
            >
              <UserOutlined /> Đăng nhập
            </button>

            <button
              className="pub-btn pub-btn-primary"
              onClick={onOpenBooking}
            >
              <CalendarOutlined /> Đặt lịch
            </button>

            {/* Mobile Hamburger */}
            <button
              className="pub-btn pub-btn-secondary"
              style={{ padding: '8px 12px', display: 'flex' }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuOutlined style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pub-logo-badge" style={{ width: 32, height: 32, fontSize: 16 }}>
              <ToolOutlined />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>
              Repair<span style={{ color: '#4f46e5' }}>Shop</span>
            </span>
          </div>
        }
        placement="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={290}
        closeIcon={<CloseOutlined />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('hero')}
          >
            Trang chủ
          </div>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('services')}
          >
            Dịch vụ sửa chữa
          </div>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('process')}
          >
            Quy trình làm việc
          </div>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('why-us')}
          >
            Tại sao chọn chúng tôi
          </div>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('track-ticket')}
          >
            🔍 Tra cứu phiếu sửa chữa
          </div>
          <div
            className="pub-nav-item"
            style={{ fontSize: 16, padding: '12px 16px' }}
            onClick={() => handleNavClick('footer')}
          >
            Thông tin liên hệ
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '16px 0' }} />

          <button
            className="pub-btn pub-btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/login');
            }}
          >
            <UserOutlined /> Đăng nhập hệ thống
          </button>

          <button
            className="pub-btn pub-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking();
            }}
          >
            <CalendarOutlined /> Đặt lịch hẹn sửa chữa
          </button>
        </div>
      </Drawer>
    </header>
  );
}
