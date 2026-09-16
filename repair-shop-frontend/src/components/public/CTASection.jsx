import React from 'react';
import { PhoneOutlined } from '@ant-design/icons';

export default function CTASection({ onScrollToSection }) {
  return (
    <section className="pub-section" style={{ paddingTop: 20 }}>
      <div className="pub-container">
        <div className="pub-cta-banner">
          <h2 className="pub-cta-title">
            Thiết bị của bạn đang gặp vấn đề?
          </h2>
          <p className="pub-cta-sub">
            Đừng để công việc và học tập bị gián đoạn. Mang ngay thiết bị đến cửa hàng hoặc liên hệ với chúng tôi để được hỗ trợ nhanh chóng nhất.
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
