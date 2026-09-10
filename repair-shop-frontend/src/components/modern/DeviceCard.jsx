import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryOutlined } from '@ant-design/icons';
import { DeviceIcon } from './TicketCard';
import { formatDateOnly } from '../../utils/helpers';

const DEVICE_TYPE_LABELS = {
  LAPTOP: 'Laptop',
  MOBILE: 'Điện thoại',
  PHONE: 'Điện thoại',
  PC: 'Máy tính bàn',
  DESKTOP: 'Máy tính bàn',
  TABLET: 'Máy tính bảng',
  IPAD: 'iPad',
  PRINTER: 'Máy in',
};

function getDeviceTypeLabel(type) {
  if (!type) return 'Thiết bị';
  return DEVICE_TYPE_LABELS[type.toUpperCase()] || type;
}

/**
 * DeviceCard — Card hiển thị một thiết bị của khách hàng
 */
export default function DeviceCard({ device, basePath = '/customer-new' }) {
  const navigate = useNavigate();
  const repairCount = device.repairCount ?? 0;
  const lastRepair = device.lastRepairDate;

  return (
    <div
      className="mc-device-card"
      onClick={() => navigate(`${basePath}/devices`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`${basePath}/devices`)}
    >
      {/* Icon */}
      <div className="mc-device-icon-wrap">
        <DeviceIcon deviceType={device.deviceType} size={32} />
      </div>

      {/* Name */}
      <div style={{
        fontWeight: 700, fontSize: 16,
        color: '#111827', marginBottom: 4,
      }}>
        {device.brand} {device.model}
      </div>

      {/* Type */}
      <div style={{
        fontSize: 13, color: '#6b7280',
        marginBottom: 16,
        background: '#f3f4f6',
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 100,
      }}>
        {getDeviceTypeLabel(device.deviceType)}
      </div>

      {/* Divider */}
      <div className="mc-divider" style={{ marginBottom: 12 }} />

      {/* Stats */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
        <strong style={{ color: '#111827' }}>{repairCount}</strong> lần sửa chữa
      </div>

      {lastRepair && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
          Gần nhất: {formatDateOnly(lastRepair)}
        </div>
      )}

      {/* Button */}
      <button
        className="mc-btn-secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={e => { e.stopPropagation(); navigate(`${basePath}/devices`); }}
      >
        <HistoryOutlined style={{ fontSize: 14 }} />
        Xem lịch sử
      </button>
    </div>
  );
}
