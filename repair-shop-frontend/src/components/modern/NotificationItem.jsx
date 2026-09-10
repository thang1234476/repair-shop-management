import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, BellOutlined, ToolOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

function getNotifIcon(type) {
  const s = { fontSize: 18 };
  if (!type) return <BellOutlined style={s} />;
  const t = type.toUpperCase();
  if (t.includes('QUOTE') || t.includes('PRICE') || t.includes('GIÁ')) return <DollarOutlined style={{ ...s, color: '#f59e0b' }} />;
  if (t.includes('REPAIR') || t.includes('REPAIRING') || t.includes('SỬA')) return <ToolOutlined style={{ ...s, color: '#4f46e5' }} />;
  if (t.includes('COMPLETE') || t.includes('DONE') || t.includes('XONG')) return <CheckCircleOutlined style={{ ...s, color: '#10b981' }} />;
  return <BellOutlined style={{ ...s, color: '#4f46e5' }} />;
}

function getIconBg(type) {
  if (!type) return '#eef2ff';
  const t = type.toUpperCase();
  if (t.includes('QUOTE') || t.includes('PRICE')) return '#fef3c7';
  if (t.includes('COMPLETE') || t.includes('DONE')) return '#d1fae5';
  return '#eef2ff';
}

/**
 * NotificationItem — Một item thông báo
 */
export default function NotificationItem({ notification, onMarkRead, basePath = '/customer-new' }) {
  const navigate = useNavigate();
  const { id, title, message, type, read, createdAt, ticketId } = notification;

  const handleClick = () => {
    if (!read && onMarkRead) onMarkRead(id);
    if (ticketId) navigate(`${basePath}/tickets/${ticketId}`);
  };

  return (
    <div
      className={`mc-notif-item${read ? '' : ' unread'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {/* Icon */}
      <div className="mc-notif-icon-wrap" style={{ background: getIconBg(type) }}>
        {getNotifIcon(type)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mc-notif-title">{title}</div>
        {message && <div className="mc-notif-desc">{message}</div>}
        <div className="mc-notif-time">
          <ClockCircleOutlined style={{ fontSize: 11 }} />
          {dayjs(createdAt).fromNow()}
        </div>
      </div>

      {/* Unread dot + navigate */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        {!read && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4f46e5', flexShrink: 0,
          }} />
        )}
        {ticketId && (
          <ArrowRightOutlined style={{ color: '#9ca3af', fontSize: 12 }} />
        )}
      </div>
    </div>
  );
}
