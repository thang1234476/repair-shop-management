import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { TOKEN_KEY, WS_URL } from '../utils/constants';
import { notification } from 'antd';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem(TOKEN_KEY);
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/queue/notifications/${user.userId}`, (message) => {
          const data = JSON.parse(message.body);
          setUnreadCount(prev => prev + 1);
          notification.info({ message: data.title, description: data.message, placement: 'topRight' });
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, [user]);

  const incrementUnread = useCallback(() => setUnreadCount(prev => prev + 1), []);
  const resetUnread = useCallback(() => setUnreadCount(0), []);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, incrementUnread, resetUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
