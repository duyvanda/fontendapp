import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { LOCALURL } from '@/utils/api';
import { useFeedback } from './FeedbackContext';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  report_stt?: string | null;
  created_at: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unread_count: number;
  loading: boolean;
  fetch_notifications: (manv: string) => Promise<void>;
  mark_as_read: (ids: number[]) => Promise<void>;
  mark_all_read: (manv: string) => Promise<void>;
  refresh_unread_count: (manv: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({} as NotificationContextValue);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user_info } = useFeedback();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread_count, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const appState = useRef(AppState.currentState);

  const fetch_notifications = useCallback(async (manv: string) => {
    if (!manv) return;
    setLoading(true);
    try {
      console.log('[NotificationContext] Fetching notifications for manv:', manv);
      const response = await fetch(`${LOCALURL}/get_data/expo_get_notifications/?manv=${manv}`);
      const data = await response.json();
      console.log('[NotificationContext] API Response data:', JSON.stringify(data));
      if (response.ok && data.status === 'ok') {
        console.log('[NotificationContext] Setting notifications state with:', data.rows_data?.length || 0, 'items');
        setNotifications(data.rows_data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh_unread_count = useCallback(async (manv: string) => {
    if (!manv) return;
    try {
      const response = await fetch(`${LOCALURL}/get_data/expo_get_unread_notifications_count/?manv=${manv}`);
      const data = await response.json();
      if (response.ok && data.status === 'ok' && data.rows_data && data.rows_data.length > 0) {
        setUnreadCount(data.rows_data[0].unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const mark_as_read = async (ids: number[]) => {
    if (!user_info?.manv || ids.length === 0) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      ids.includes(n.id) ? { ...n, is_read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - ids.length));

    try {
      for (const id of ids) {
        await fetch(`${LOCALURL}/post_data/expo_insert_mark_notification_read/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{ id: id }]),
        });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      // Revert optimistic update? Or let it be since it's just read status.
    }
  };

  const mark_all_read = async (manv: string) => {
    if (!manv) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await fetch(`${LOCALURL}/post_data/expo_insert_mark_all_notifications_read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ manv }]),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Poll for unread count when app is in foreground and user is logged in
  useEffect(() => {
    if (!user_info?.manv) return;

    // Initial fetch
    refresh_unread_count(user_info.manv);

    const interval = setInterval(() => {
      if (appState.current === 'active') {
        refresh_unread_count(user_info.manv);
      }
    }, 60000); // Check every 60s

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        refresh_unread_count(user_info.manv);
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user_info?.manv, refresh_unread_count]);

  // Listen for incoming notifications while app is in foreground
  useEffect(() => {
    if (!user_info?.manv) return;
    
    const notificationListener = Notifications.addNotificationReceivedListener(() => {
      // Refresh count when a new push is received
      refresh_unread_count(user_info.manv);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, [user_info?.manv, refresh_unread_count]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread_count,
        loading,
        fetch_notifications,
        mark_as_read,
        mark_all_read,
        refresh_unread_count
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
