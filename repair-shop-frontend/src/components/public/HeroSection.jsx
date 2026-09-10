import React from 'react';
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  SearchOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ToolOutlined
} from '@ant-design/icons';

export default function HeroSection({ onOpenBooking, onScrollToSection }) {
  return (
    <section className="pub-hero" id="hero">
      <div className="pub-container">
        <div className="pub-hero-grid">
          {/* Left: Text & CTA */}
          <div>
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
                style={{ padding: '14px 28px', fontSize: 16 }}
                onClick={onOpenBooking}
              >
                <CalendarOutlined /> Đặt lịch sửa chữa ngay
              </button>

              <button
                className="pub-btn pub-btn-secondary"
                style={{ padding: '14px 24px', fontSize: 16 }}
                onClick={() => onScrollToSection('track-ticket')}
              >
                <SearchOutlined /> Tra cứu tiến độ phiếu
              </button>
            </div>

            {/* Micro proof points */}
            <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
                <CheckCircleFilled style={{ color: '#10b981' }} /> Kiểm tra & báo giá miễn phí
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
                <CheckCircleFilled style={{ color: '#10b981' }} /> Bảo hành dịch vụ tới 12 tháng
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
                <CheckCircleFilled style={{ color: '#10b981' }} /> Cập nhật tiến độ tức thì
              </div>
            </div>
          </div>

          {/* Right: Visual Illustration Card */}
          <div className="pub-hero-visual">
            {/* Floating widget: Completed badge */}
            <div className="pub-hero-floating top-right">
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#dcfce7', color: '#15803d',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>
                <CheckCircleFilled />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Trạng thái</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Đã hoàn tất sửa chữa</div>
              </div>
            </div>

            {/* Main Interactive Card Mockup */}
            <div className="pub-hero-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#eef2ff', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>
                    💻
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                      MacBook Pro M1 2021
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Mã phiếu: <strong style={{ color: '#4f46e5' }}>TK-2024-089</strong>
                    </div>
                  </div>
                </div>
                <span style={{
                  background: '#dbeafe', color: '#1d4ed8',
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700
                }}>
                  Đang sửa chữa
                </span>
              </div>

              {/* Progress bar visual */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  <span>Tiến trình xử lý</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5' }}>Bước 5 / 7</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: 99 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                  <span>Tiếp nhận</span>
                  <span>Kiểm tra</span>
                  <span>Báo giá</span>
                  <strong style={{ color: '#4f46e5' }}>Sửa chữa</strong>
                  <span>Hoàn tất</span>
                </div>
              </div>

              {/* Technician Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#e0e7ff', color: '#4338ca',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12
                  }}>
                    KV
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>KTV. Trần Minh Tuấn</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Kỹ thuật viên phần cứng</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                  <ThunderboltOutlined /> Đang xử lý
                </div>
              </div>
            </div>

            {/* Floating widget: Realtime notification */}
            <div className="pub-hero-floating bottom-left">
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#e0e7ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                <ClockCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Thông báo tức thì</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Cập nhật trạng thái tự động</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
