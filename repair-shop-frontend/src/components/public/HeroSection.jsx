import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SafetyCertificateOutlined,
  UserOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="pub-hero" id="hero">
      <div className="pub-container">
        <div className="pub-hero-single">
          <div className="pub-badge-pill">
            <SafetyCertificateOutlined /> TRUNG TÂM SỬA CHỮA THIẾT BỊ ĐIỆN TỬ CHUYÊN NGHIỆP
          </div>

          <h1 className="pub-hero-title">
            Sửa chữa thiết bị của bạn<br />
            <span>nhanh chóng & minh bạch</span>
          </h1>

          <p className="pub-hero-sub">
            Tiếp nhận, chẩn đoán lỗi chuyên sâu, báo giá chi tiết và sửa chữa Laptop, PC, Điện thoại với linh kiện chính hãng. Theo dõi tiến độ sửa chữa trực tuyến 24/7.
          </p>

          <div className="pub-hero-actions">
            <button
              className="pub-btn pub-btn-primary"
              style={{ padding: '14px 32px', fontSize: 16 }}
              onClick={() => navigate('/login')}
            >
              <UserOutlined /> Đăng nhập theo dõi
            </button>
          </div>

          {/* Micro proof points */}
          <div className="pub-hero-proof">
            <div className="pub-hero-proof-item">
              <CheckCircleFilled style={{ color: '#10b981' }} /> Kiểm tra & báo giá miễn phí
            </div>
            <div className="pub-hero-proof-item">
              <CheckCircleFilled style={{ color: '#10b981' }} /> Bảo hành dịch vụ tới 12 tháng
            </div>
            <div className="pub-hero-proof-item">
              <CheckCircleFilled style={{ color: '#10b981' }} /> Cập nhật tiến độ tức thì
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

