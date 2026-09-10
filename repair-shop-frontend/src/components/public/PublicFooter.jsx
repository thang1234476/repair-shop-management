import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ToolOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

export default function PublicFooter({ onOpenBooking, onScrollToSection }) {
  const navigate = useNavigate();

  return (
    <footer className="pub-footer" id="footer">
      <div className="pub-container">
        <div className="pub-footer-grid">
          {/* Brand Col */}
          <div>
            <div className="pub-footer-brand">
              <div className="pub-logo-badge" style={{ width: 34, height: 34, fontSize: 18 }}>
                <ToolOutlined />
              </div>
              Repair<span style={{ color: '#818cf8' }}>Shop</span>
            </div>
            <p className="pub-footer-desc">
              Hệ thống trung tâm kỹ thuật sửa chữa thiết bị điện tử công nghệ cao. Mang đến giải pháp xử lý sự cố nhanh chóng, minh bạch và đáng tin cậy.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <span style={{
                background: '#1e293b', padding: '6px 14px', borderRadius: 999,
                fontSize: 12, color: '#38bdf8', fontWeight: 600
              }}>
                ⭐ Đánh giá 4.9/5 từ khách hàng
              </span>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="pub-footer-heading">Dịch Vụ Sửa Chữa</h4>
            <ul className="pub-footer-links">
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Sửa chữa Laptop</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Sửa chữa PC & Máy bàn</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Sửa chữa Điện thoại</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Vệ sinh & Tra keo tản nhiệt</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Nâng cấp RAM & SSD</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('services')}>Đo đạc & Chẩn đoán lỗi</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="pub-footer-heading">Liên Kết Nhanh</h4>
            <ul className="pub-footer-links">
              <li className="pub-footer-link" onClick={() => onScrollToSection('hero')}>Trang chủ</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('track-ticket')}>Tra cứu phiếu sửa chữa</li>
              <li className="pub-footer-link" onClick={onOpenBooking}>Đặt lịch hẹn</li>
              <li className="pub-footer-link" onClick={() => onScrollToSection('process')}>Quy trình 7 bước</li>
              <li className="pub-footer-link" onClick={() => navigate('/login')}>Cổng đăng nhập hệ thống</li>
              <li className="pub-footer-link" onClick={() => navigate('/login/customer')}>Dành cho Khách hàng</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="pub-footer-heading">Thông Tin Liên Hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#94a3b8' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <EnvironmentOutlined style={{ color: '#818cf8', fontSize: 16, marginTop: 4 }} />
                <span>Số 123 Đường Công Nghệ, Quận Cầu Giấy, TP. Hà Nội</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <PhoneOutlined style={{ color: '#818cf8', fontSize: 16 }} />
                <span>Hotline: <strong style={{ color: '#ffffff' }}>1900 6868 / 0988 123 456</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <MailOutlined style={{ color: '#818cf8', fontSize: 16 }} />
                <span>Email: support@repairshop.vn</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <ClockCircleOutlined style={{ color: '#818cf8', fontSize: 16 }} />
                <span>Giờ làm việc: 08:00 - 20:30 (Thứ 2 - Chủ Nhật)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pub-footer-bottom">
          <div>
            © {new Date().getFullYear()} RepairShop Management System. Tất cả các quyền được bảo lưu.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ cursor: 'pointer' }}>Chính sách bảo mật</span>
            <span style={{ cursor: 'pointer' }}>Điều khoản dịch vụ</span>
            <span style={{ cursor: 'pointer' }}>Chính sách bảo hành</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
