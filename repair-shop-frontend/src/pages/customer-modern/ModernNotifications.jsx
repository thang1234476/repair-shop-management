import React, { useState, useEffect } from 'react';
import { Spin, Button, message } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { customerApi } from '../../api/customerApi';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from '../../components/modern/NotificationItem';

const BASE = '/customer-new';

const TYPE_FILTERS = [
  { key: 'ALL',    label: 'Tất cả' },
  { key: 'UNREAD', label: 'Chưa đọc' },
  { key: 'READ',   label: 'Đã đọc' },
];

export default function ModernNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { resetUnread } = useNotification();

  useEffect(() => {
    fetchNotifications();
    resetUnread();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getNotifications({ size: 50, sort: 'createdAt,desc' });
      setNotifications(res.data.data.content || []);
    } catch {
      message.error('Lỗi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await customerApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      message.error('Lỗi đánh dấu đã đọc');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => customerApi.markNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      message.success('Đã đánh dấu tất cả là đã đọc');
      resetUnread();
    } catch {
      message.error('Lỗi khi đánh dấu');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayed = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'READ')   return n.read;
    return true;
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="mc-flex-between mc-mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
            Thông báo
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 10, fontSize: 14, fontWeight: 700,
                background: '#4f46e5', color: 'white',
                padding: '2px 10px', borderRadius: 100,
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Cập nhật mới nhất về thiết bị của bạn
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            icon={<CheckOutlined />}
            onClick={markAllRead}
            style={{ borderRadius: 10, borderColor: '#4f46e5', color: '#4f46e5' }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="mc-filter-tabs mc-mb-20">
        {TYPE_FILTERS.map(tab => {
          const count = tab.key === 'ALL'
            ? notifications.length
            : tab.key === 'UNREAD'
              ? notifications.filter(n => !n.read).length
              : notifications.filter(n => n.read).length;
          return (
            <button
              key={tab.key}
              className={`mc-filter-tab${filter === tab.key ? ' active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: filter === tab.key ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                  color: filter === tab.key ? 'white' : '#374151',
                  padding: '0 6px', borderRadius: 100,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="mc-card">
          <div className="mc-empty">
            <div className="mc-empty-icon">
              <BellOutlined style={{ fontSize: 56, color: '#d1d5db' }} />
            </div>
            <div className="mc-empty-title">
              {filter === 'UNREAD' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </div>
            <div className="mc-empty-desc">
              {filter === 'UNREAD'
                ? 'Tất cả thông báo đã được đọc'
                : 'Thông báo về tình trạng sửa chữa thiết bị sẽ xuất hiện tại đây'}
            </div>
          </div>
        </div>
      ) : (
        <div className="mc-card" style={{ padding: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {displayed.map(notif => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={markRead}
                basePath={BASE}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
