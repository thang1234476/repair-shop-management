import React from 'react';
import { WarningOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * ActionAlert — Banner thông báo hành động cần thực hiện
 * Ví dụ: "Bạn có 1 báo giá chờ xác nhận"
 */
export default function ActionAlert({ ticketId, ticketCode, basePath = '/customer-new' }) {
  const navigate = useNavigate();

  if (!ticketId) return null;

  return (
    <div className="mc-action-alert mc-mb-24">
      <div className="mc-action-alert-content">
        <span className="mc-action-alert-icon">⚠️</span>
        <div>
          <div className="mc-action-alert-title">
            Bạn cần xác nhận báo giá sửa chữa
          </div>
          <div className="mc-action-alert-sub">
            Phiếu {ticketCode} đang chờ xác nhận để tiến hành sửa chữa
          </div>
        </div>
      </div>
      <button
        className="mc-btn-primary"
        style={{ flexShrink: 0, fontSize: 13, padding: '8px 16px' }}
        onClick={() => navigate(`${basePath}/tickets/${ticketId}`)}
      >
        Xem báo giá <ArrowRightOutlined />
      </button>
    </div>
  );
}
