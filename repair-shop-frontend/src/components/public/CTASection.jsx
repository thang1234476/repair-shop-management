import React from 'react';
import { CalendarOutlined, PhoneOutlined } from '@ant-design/icons';

export default function CTASection({ onOpenBooking, onScrollToSection }) {
  return (
    <section className="pub-section" style={{ paddingTop: 20 }}>
      <div className="pub-container">
        <div className="pub-cta-banner">
          <h2 className="pub-cta-title">
            Thiết bị của bạn đang gặp vấn đề?
          </h2>
          <p className="pub-cta-sub">
            Đừng để công việc và học tập bị gián đoạn. Đặt lịch kiểm tra ngay hôm nay để được kỹ thuật viên hỗ trợ chuẩn xác, nhanh chóng và tận tâm nhất.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              className="pub-btn"
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}
              onClick={onOpenBooking}
            >
              <CalendarOutlined /> Đặt lịch hẹn sửa chữa
            </button>

            <button
              className="pub-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '14px 28px',
                fontSize: 16,
                fontWeight: 600,
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => onScrollToSection('footer')}
            >
              <PhoneOutlined /> Liên hệ tư vấn ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
