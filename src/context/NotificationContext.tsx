

import { LOCALURL } from '@/utils/api';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { router } from 'expo-router';
import { get_push_token, save_push_token } from '../storage/notification';
import { useFeedback } from './FeedbackContext';
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';

import * as Application from 'expo-application';
import * as Device from 'expo-device';

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
  const { user_info, reports } = useFeedback();
  const [notifications, set_notifications] = useState<AppNotification[]>([]);
  const [unread_count, set_unread_count] = useState(0);
  const [loading, set_loading] = useState(false);

  const app_state = useRef(AppState.currentState);

  const fetch_notifications = useCallback(async (manv: string) => {
    if (!manv) return;
    set_loading(true);
    try {
      console.log('[NotificationContext] Fetching notifications for manv:', manv);
      const response = await fetch(`${LOCALURL}/get_data/expo_get_notifications/?manv=${manv}`);
      const data = await response.json();
      console.log('[NotificationContext] API Response data:', JSON.stringify(data));
      if (response.ok && data.status === 'ok') {
        console.log('[NotificationContext] Setting notifications state with:', data.rows_data?.length || 0, 'items');
        set_notifications(data.rows_data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set_loading(false);
    }
  }, []);

  const refresh_unread_count = useCallback(async (manv: string) => {
    if (!manv) return;
    try {
      const response = await fetch(`${LOCALURL}/get_data/expo_get_unread_notifications_count/?manv=${manv}`);
      const data = await response.json();
      if (response.ok && data.status === 'ok' && data.rows_data && data.rows_data.length > 0) {
        const count = data.rows_data[0].unread_count || 0;
        set_unread_count(count);
        // Đồng bộ badge icon app với unread_count thực từ server
        await Notifications.setBadgeCountAsync(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const mark_as_read = async (ids: number[]) => {
    if (!user_info?.manv || ids.length === 0) return;

    // Optimistic update using functional state update to prevent race conditions
    set_notifications(prev => {
      const updated = prev.map(n => (ids.includes(n.id) ? { ...n, is_read: true } : n));
      const remaining_unread = updated.filter(n => !n.is_read).length;
      
      set_unread_count(remaining_unread);
      Notifications.setBadgeCountAsync(remaining_unread);
      
      return updated;
    });

    try {
      await fetch(`${LOCALURL}/post_data/expo_insert_mark_notification_read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids.map(id => ({ id }))),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      // Revert optimistic update? Or let it be since it's just read status.
    }
  };

  const mark_all_read = async (manv: string) => {
    if (!manv) return;

    set_notifications(prev => prev.map(n => ({ ...n, is_read: true })));
    set_unread_count(0);
    // Xóa badge trên icon app
    await Notifications.setBadgeCountAsync(0);

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

  // Lấy và lưu Token cục bộ (Có thể gọi trước khi login)
  const setup_push_token = useCallback(async () => {
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
        return null;
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

      // Lưu xuống Storage
      await save_push_token(push_token);
      return push_token;
    } catch (error) {
      console.error('[NotificationContext] Error setting up push token:', error);
      return null;
    }
  }, []);

  // Register Push Token with Backend API (Khi login thành công)
  const register_push_token_async = useCallback(async (manv: string) => {
    if (!manv) return;

    try {
      let push_token = await get_push_token();
      if (!push_token) {
        push_token = await setup_push_token();
      }

      if (!push_token) return;

      // 4. Thu thập toàn bộ thông tin thiết bị chi tiết
      const brand = Device.brand || '';
      const model_name = Device.modelName || '';
      const device_name = Device.deviceName || '';
      const os_name = Device.osName || Platform.OS;
      const os_version = Device.osVersion || String(Platform.Version);
      const app_version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
      const build_number = Application.nativeBuildVersion || '1';
      const is_device = Device.isDevice;

      const device_info = {
        platform: Platform.OS,
        brand,
        model_name,
        device_name,
        os_name,
        os_version,
        app_version,
        build_number,
        is_device,
      };

      // 5. Lưu Push Token & device_info (JSONB) về Backend PostgreSQL
      await fetch(`${LOCALURL}/post_data/expo_push_token_register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          manv,
          token: push_token,
          platform: Platform.OS,
          device_info,
        }]),
      });
    } catch (error) {
      console.error('[NotificationContext] Error registering push token:', error);
    }
  }, [setup_push_token]);

  // Điều hướng deep-link sang màn hình báo cáo khi bấm thông báo
  const navigate_to_report = useCallback((report_stt: string) => {
    if (!report_stt) return;
    const report = reports?.find(r => String(r.stt) === String(report_stt));
    if (report) {
      if (Number(report.type) === 4 || report.stt in NATIVE_REPORTS_MAP) {
        router.push(`/report/native/${report_stt}` as any);
      } else if (report.link_report?.startsWith('/realtime')) {
        router.push(`/realtime/${report_stt}` as any);
      } else {
        router.push(`/report/${report_stt}` as any);
      }
    } else {
      if (report_stt in NATIVE_REPORTS_MAP) {
        router.push(`/report/native/${report_stt}` as any);
      } else {
        router.push(`/report/${report_stt}` as any);
      }
    }
  }, [reports]);

  const handle_notification_response = useCallback((response: Notifications.NotificationResponse) => {
    if (user_info?.manv) {
      refresh_unread_count(user_info.manv);
    }
    const data = response?.notification?.request?.content?.data;
    if (data && data.report_stt) {
      navigate_to_report(String(data.report_stt));
    }
  }, [user_info?.manv, refresh_unread_count, navigate_to_report]);

  // Xử lý deep-linking cho trường hợp App bị tắt hẳn (Killed State)
  const last_response = Notifications.useLastNotificationResponse();
  const handled_last_response_id = useRef<string | null>(null);

  useEffect(() => {
    if (
      last_response &&
      last_response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
      user_info?.manv
    ) {
      const response_id = last_response.notification.request.identifier;
      if (handled_last_response_id.current !== response_id) {
        handled_last_response_id.current = response_id;
        handle_notification_response(last_response);
      }
    }
  }, [last_response, user_info?.manv, handle_notification_response]);

  // Poll for unread count when app is in foreground and user is logged in
  useEffect(() => {
    if (!user_info?.manv) return;

    // Initial fetch & Register Push Token
    register_push_token_async(user_info.manv);
    refresh_unread_count(user_info.manv);

    const interval = setInterval(() => {
      if (app_state.current === 'active') {
        refresh_unread_count(user_info.manv);
      }
    }, 60000); // Check every 60s

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (app_state.current.match(/inactive|background/) && nextAppState === 'active') {
        register_push_token_async(user_info.manv);
        refresh_unread_count(user_info.manv);
      }
      app_state.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user_info?.manv, refresh_unread_count, register_push_token_async]);

  // Listen for incoming notifications while app is in foreground / background
  useEffect(() => {
    if (!user_info?.manv) return;

    let notification_listener: any;
    let response_listener: any;

    try {
      notification_listener = Notifications.addNotificationReceivedListener(() => {
        refresh_unread_count(user_info.manv);
      });

      response_listener = Notifications.addNotificationResponseReceivedListener((response) => {
        handle_notification_response(response);
      });
    } catch (e) {
      console.log('Notification listener setup error:', e);
    }

    return () => {
      if (notification_listener) notification_listener.remove();
      if (response_listener) response_listener.remove();
    };
  }, [user_info?.manv, refresh_unread_count, handle_notification_response]);

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
