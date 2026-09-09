import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LaptopOutlined, MobileOutlined, DesktopOutlined, TabletOutlined, PrinterOutlined, QuestionOutlined, ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import RepairProgressSteps from './RepairProgressSteps';
import { formatDate } from '../../utils/helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const STATUS_LABELS = {
  RECEIVED:   'Đã tiếp nhận',
  DIAGNOSING: 'Đang kiểm tra',
  QUOTED:     'Đã có báo giá',
  APPROVED:   'Đã xác nhận',
  REPAIRING:  'Đang sửa chữa',
  COMPLETED:  'Đã sửa xong',
  DELIVERED:  'Đã bàn giao',
  CANCELLED:  'Đã hủy',
};

function DeviceIcon({ deviceType, size = 24 }) {
  const style = { fontSize: size, color: '#4f46e5' };
  const type = (deviceType || '').toUpperCase();
  if (type.includes('LAPTOP') || type.includes('NOTEBOOK')) return <LaptopOutlined style={style} />;
  if (type.includes('PHONE') || type.includes('ĐIỆN THOẠI') || type.includes('MOBILE')) return <MobileOutlined style={style} />;
  if (type.includes('PC') || type.includes('DESKTOP') || type.includes('MÁY TÍNH')) return <DesktopOutlined style={style} />;
  if (type.includes('TABLET') || type.includes('IPAD')) return <TabletOutlined style={style} />;
  if (type.includes('PRINTER') || type.includes('MÁY IN')) return <PrinterOutlined style={style} />;
  return <LaptopOutlined style={style} />;
}

function relativeTimeStr(date) {
  if (!date) return '';
  const d = dayjs(date);
  const now = dayjs();
  if (now.diff(d, 'hour') < 24) return d.fromNow();
  return formatDate(date);
}

/**
 * TicketCard — Card hiển thị một phiếu sửa chữa
 */
export default function TicketCard({ ticket, basePath = '/customer-new' }) {
  const navigate = useNavigate();
  const statusClass = `status-${ticket.status?.toLowerCase()}`;
  const label = STATUS_LABELS[ticket.status] || ticket.status;
  const isActive = !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(ticket.status);

  return (
    <div
      className={`mc-ticket-card ${statusClass}`}
      onClick={() => navigate(`${basePath}/tickets/${ticket.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`${basePath}/tickets/${ticket.id}`)}
    >
      {/* Header */}
      <div className="mc-flex-between mc-gap-12 mc-mb-12">
        <div className="mc-flex mc-gap-12">
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: '#eef2ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <DeviceIcon deviceType={ticket.device?.deviceType} size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.3 }}>
              {ticket.device?.brand} {ticket.device?.model}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              {ticket.ticketCode}
            </div>
          </div>
        </div>
        <span className={`mc-status-badge mc-status-${ticket.status}`}>
          {label}
        </span>
      </div>

      {/* Issue */}
      {ticket.issueDescription && (
        <div style={{
          fontSize: 13, color: '#6b7280', marginBottom: 14,
          background: '#f9fafb', borderRadius: 8, padding: '8px 12px',
          borderLeft: '3px solid #e5e7eb',
        }}>
          "{ticket.issueDescription.length > 100
            ? ticket.issueDescription.slice(0, 100) + '...'
            : ticket.issueDescription}"
        </div>
      )}

      {/* Progress (chỉ hiển thị cho phiếu đang active) */}
      {isActive && <RepairProgressSteps status={ticket.status} compact />}

      {/* Footer */}
      <div className="mc-flex-between" style={{ marginTop: 14 }}>
        <div className="mc-flex mc-gap-8" style={{ color: '#9ca3af', fontSize: 12 }}>
          <ClockCircleOutlined />
          <span>
            {ticket.updatedAt
              ? `Cập nhật ${relativeTimeStr(ticket.updatedAt)}`
              : `Tạo ${formatDate(ticket.createdAt)}`}
          </span>
        </div>
        <div className="mc-flex mc-gap-4" style={{ color: '#4f46e5', fontSize: 13, fontWeight: 600 }}>
          Xem chi tiết <ArrowRightOutlined style={{ fontSize: 11 }} />
        </div>
      </div>
    </div>
  );
}

export { DeviceIcon };
