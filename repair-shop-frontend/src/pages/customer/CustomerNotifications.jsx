import React, { useEffect, useState } from 'react';
import { List, Card, Button, message } from 'antd';
import { customerApi } from '../../api/customerApi';
import { formatDate } from '../../utils/helpers';
import { useNotification } from '../../context/NotificationContext';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const { resetUnread } = useNotification();

  useEffect(() => {
    fetchNotifications();
    resetUnread();
  }, [resetUnread]);

  const fetchNotifications = async () => {
    try {
      const res = await customerApi.getNotifications({ size: 20, sort: 'createdAt,desc' });
      setNotifications(res.data.data.content);
    } catch (error) {
      message.error('Lỗi tải thông báo');
    }
  };

  const markRead = async (id) => {
    try {
      await customerApi.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      message.error('Lỗi');
    }
  };

  return (
    <Card title={<span style={{color:'white'}}>Thông báo</span>} className="glass-card">
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            actions={[!item.read && <Button type="link" onClick={() => markRead(item.id)}>Đánh dấu đã đọc</Button>]}
            style={{ opacity: item.read ? 0.6 : 1 }}
          >
            <List.Item.Meta
              title={<span style={{ color: item.read ? '#aaa' : 'white' }}>{item.title}</span>}
              description={
                <>
                  <div style={{ color: '#ccc' }}>{item.message}</div>
                  <small>{formatDate(item.createdAt)}</small>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
