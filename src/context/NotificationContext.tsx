import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { LOCALURL } from '@/utils/api';
import { useFeedback } from './FeedbackContext';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AppState, AppStateStatus, Platform } from 'react-native';

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
      await Promise.all(
        ids.map((id) =>
          fetch(`${LOCALURL}/post_data/expo_insert_mark_notification_read/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{ id }]),
          })
        )
      );
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

  // Register Push Token with Backend API
  const register_push_token_async = useCallback(async (manv: string) => {
    if (!manv) return;

    try {
      // 1. Xin quyền thông báo
      const { status: existing_status } = await Notifications.getPermissionsAsync();
      let final_status = existing_status;

      if (existing_status !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        final_status = status;
      }

      if (final_status !== 'granted') {
        console.log('[NotificationContext] Permission not granted for push notifications!');
        return;
      }

      // 2. Cấu hình Channel cho Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Thông báo hệ thống',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00A79D',
        });
      }

      // 3. Lấy Expo Push Token
      const project_id = Constants.expoConfig?.extra?.eas?.projectId;
      const token_data = await Notifications.getExpoPushTokenAsync({
        projectId: project_id,
      });

      const push_token = token_data.data;
      console.log('[NotificationContext] Generated Push Token:', push_token);

      // 4. Lưu Push Token về Backend PostgreSQL
      await fetch(`${LOCALURL}/post_data/expo_insert_push_token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ manv, push_token, platform: Platform.OS }]),
      });
    } catch (error) {
      console.error('[NotificationContext] Error registering push token:', error);
    }
  }, []);

  // Poll for unread count when app is in foreground and user is logged in
  useEffect(() => {
    if (!user_info?.manv) return;

    // Initial fetch & Register Push Token
    register_push_token_async(user_info.manv);
    refresh_unread_count(user_info.manv);

    const interval = setInterval(() => {
      if (appState.current === 'active') {
        refresh_unread_count(user_info.manv);
      }
    }, 60000); // Check every 60s

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        register_push_token_async(user_info.manv);
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

    let notificationListener: any;
    let responseListener: any;

    try {
      notificationListener = Notifications.addNotificationReceivedListener(() => {
        refresh_unread_count(user_info.manv);
      });

      responseListener = Notifications.addNotificationResponseReceivedListener(() => {
        refresh_unread_count(user_info.manv);
      });
    } catch (e) {
      console.log('Notification listener setup error:', e);
    }

    return () => {
      if (notificationListener) notificationListener.remove();
      if (responseListener) responseListener.remove();
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
