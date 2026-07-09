/**
 * FeedbackContext — Core state management cho BI Portal.
 * Port từ frontend1/src/context/FeedbackContext.js
 * Thay thế: localStorage → AsyncStorage, window.* → Dimensions
 */
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  clear_all_auth,
  get_reports_list,
  get_user_hr_info,
  get_user_info,
  save_reports_list,
  save_user_hr_info,
  save_user_info,
  user_hr_info_type,
  user_info_type,
} from '@/storage/auth';
import { API_BASE_URL, LOCALURL, REPORTS_API_URL } from '@/utils/api';
import { get_version } from '@/utils/string';
//import { registerForPushNotificationsAsync, unregisterPushToken } from '@/utils/notifications';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Report {
  stt: string;
  tenreport: string;
  id: string;
  id_mb: string;
  param: string;
  param_mb: string;
  vw: string;
  type: number;
  link_report: string;
  manv: string;
  yeu_thich?: string;
  tags?: string | string[];
}

interface FeedbackContextValue {
  // Auth state
  user_info: user_info_type | null;
  user_hr_info: user_hr_info_type | null;
  login_text: string;
  login_loading: boolean;
  // Report state
  reports: Report[];
  filter_reports: Report | null;
  report_id: string;
  report_param: string;
  shared: boolean;
  loading: boolean;
  rp_screen: boolean;
  // Actions
  login_user: (data: { email: string; password: string }) => Promise<void>;
  logout_user: () => Promise<void>;
  fetch_reports: (manv: string) => Promise<void>;
  fetch_filter_reports: (stt: string, isMB: boolean) => void;
  fetch_filter_reports_rt: (stt: string, isMB: boolean, filter_data: Record<string, unknown>) => Promise<void>;
  clear_filter_report: () => void;
  user_logger: (manv: string, id: string, isMB: boolean, dv_width: number) => void;
  set_rp_screen: (val: boolean) => void;
  toggle_favorite: (report: Report) => Promise<void>;
}

// ─── Context init ──────────────────────────────────────────────────────────────

const FeedbackContext = createContext<FeedbackContextValue>(
  {} as FeedbackContextValue,
);

export const useFeedback = () => useContext(FeedbackContext);

// ─── Provider ──────────────────────────────────────────────────────────────────

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Auth state
  const [user_info, set_user_info] = useState<user_info_type | null>(null);
  const [user_hr_info, set_user_hr_info] = useState<user_hr_info_type | null>(null);
  const [login_text, set_login_text] = useState('');
  const [login_loading, set_login_loading] = useState(false);

  // Report state
  const [reports, set_reports] = useState<Report[]>([]);
  const [filter_reports, set_filter_reports] = useState<Report | null>(null);
  const [report_id, set_report_id] = useState('');
  const [report_param, set_report_param] = useState('');
  const [shared, set_shared] = useState(true);
  const [loading, set_loading] = useState(false);
  const [rp_screen, set_rp_screen] = useState(false);

  // ── Init: Load user từ AsyncStorage khi app khởi động ─────────────────────
  useEffect(() => {
    (async () => {
      const stored_user = await get_user_info();
      const stored_hr = await get_user_hr_info();
      if (stored_user) {
        set_user_info(stored_user);
        if (stored_hr) set_user_hr_info(stored_hr);
        await fetch_reports(stored_user.manv);
        // Tạm thời tắt đăng ký Push Notification
        // registerForPushNotificationsAsync(stored_user.manv);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth: Login ────────────────────────────────────────────────────────────
  const login_user = async (logindata: { email: string; password: string }) => {
    set_login_loading(true);
    set_login_text('');
    try {
      const response = await fetch(`${API_BASE_URL}/loginv1/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logindata),
      });
      const data = await response.json();
      if (!response.ok) {
        set_login_text(data.message || 'Đăng nhập thất bại');
      } else {
        await save_user_info(data);
        set_user_info(data);
        await fetch_reports(data.manv);
        // Tạm thời tắt đăng ký Push Notification
        // registerForPushNotificationsAsync(data.manv);
      }
    } catch (err) {
      set_login_text('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      set_login_loading(false);
    }
  };

  // ── Auth: Logout ───────────────────────────────────────────────────────────
  const logout_user = async () => {
    // if (user_info?.manv) {
    //   // Don't await unregister so it doesn't block logout
    //   unregisterPushToken(user_info.manv);
    // }
    await clear_all_auth();
    set_user_info(null);
    set_user_hr_info(null);
    set_reports([]);
    set_filter_reports(null);
    set_login_text('');

    // Loại bỏ dismissAll() vì dismissAll trên root stack có thể gây ra lỗi màn hình trắng trong Expo Router.
    // Thực hiện replace trực tiếp.
    router.replace('/login');
  };

  // ── Reports: Fetch danh sách reports của user ──────────────────────────────
  const fetch_reports = async (manv: string) => {
    try {
      const response = await fetch(`${REPORTS_API_URL}?manv=${manv}&is_app=1`);
      const responseText = await response.text();
      // Replace http with https for any hardcoded backend URLs
      const replacedText = responseText.replace(/http:\/\/bi\.meraplion\.com/g, 'https://bi.meraplion.com');
      const data = JSON.parse(replacedText);
      const raw_reports: Report[] = data['rows_data'] || [];
      const lstreports = raw_reports.map((el) => ({ ...el, manv }));
      set_reports(lstreports);
      await save_reports_list(lstreports);

      if (data['user_hr_info']) {
        await save_user_hr_info(data['user_hr_info']);
        set_user_hr_info(data['user_hr_info']);
      }
    } catch (err) {
      console.error('fetch_reports error:', err);
      // Load from cache nếu offline
      const cached = await get_reports_list();
      if (cached.length > 0) set_reports(cached as Report[]);
    }
  };

  // ── Reports: Filter report tĩnh (Looker Studio embed trực tiếp) ────────────
  const fetch_filter_reports = (stt: string, isMB: boolean) => {
    const manv = user_info?.manv || '';
    const manv_int_0 = manv.replace(/MR/g, '11');
    const filtered = reports.filter((el) => el.stt === stt);
    const report_obj = filtered[0];

    set_filter_reports(report_obj || null);

    if (report_obj) {
      set_shared(true);
      const rpvw = isMB ? '95vw' : report_obj.vw;
      const rpid = isMB ? report_obj.id_mb : report_obj.id;
      set_report_id(rpid);
      const rppr = isMB ? report_obj.param_mb : report_obj.param;
      if (report_obj.type === 1) {
        set_report_param(
          rppr.replace('xxxxxx', manv).replace(/vvvvvv/g, manv_int_0),
        );
      } else {
        set_report_param(rppr.replace('xxxxxx', 'MR0000'));
      }
    } else {
      set_shared(false);
    }
  };

  // ── Reports: Fetch realtime report ─────────────────────────────────────────
  const fetch_real_time_report = async (
    data_user: Record<string, unknown>,
    local_url: string,
    rppr: string,
  ) => {
    set_shared(false);
    set_loading(true);
    try {
      const response = await fetch(`${LOCALURL}/${local_url}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_user),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        set_shared(false);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        set_shared(false);
      } else {
        set_report_param(
          rppr
            .replace(/xxxxxx/g, data_user.manv as string)
            .replace(/vvvvvv/g, data_user.version as string),
        );
        set_shared(true);
      }
    } catch (err) {
      console.error('fetch_real_time_report error:', err);
      set_shared(false);
    } finally {
      set_loading(false);
    }
  };

  const fetch_filter_reports_rt = async (
    stt: string,
    isMB: boolean,
    filter_data: Record<string, unknown>,
  ) => {
    try {
      const manv = user_info?.manv || '';
      const report_obj = reports.find((el) => el.stt === stt);
      if (!report_obj) return;

      set_filter_reports(report_obj);
      const rpid = isMB ? report_obj.id_mb : report_obj.id;
      set_report_id(rpid);

      const link_report = report_obj.link_report;
      const new_local_url = link_report.split('=')[1];
      const new_phancap = String(report_obj.type) !== '0';
      const version = get_version();

      const base_data = { manv, mobile: isMB, version, phancap: new_phancap };
      const new_data = { ...base_data, ...filter_data };
      const rppr = isMB ? report_obj.param_mb : report_obj.param;

      await fetch_real_time_report(new_data, new_local_url, rppr);
    } catch (err) {
      console.error('fetch_filter_reports_rt error:', err);
      set_shared(false);
      set_loading(false);
    }
  };

  // ── Reports: Clear filter ──────────────────────────────────────────────────
  const clear_filter_report = () => {
    set_filter_reports(null);
  };

  // ── Logger ─────────────────────────────────────────────────────────────────
  const user_logger = (
    manv: string,
    id: string,
    isMB: boolean,
    dv_width: number,
  ) => {
    fetch(`${LOCALURL}/userreportlogger/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manv, id, ismb: isMB, dv_width }),
    }).catch(() => void 0); // Fire and forget
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const toggle_favorite = async (report: Report) => {
    if (!user_info?.manv) return;
    const is_fav = report.yeu_thich && String(report.yeu_thich) !== '0';

    // Optimistic update
    set_reports(prev => prev.map(r =>
      r.stt === report.stt ? { ...r, yeu_thich: is_fav ? '0' : '1' } : r
    ));

    try {
      await fetch(`${LOCALURL}/post_data/insert_report_user_prefs_fav/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          manv: user_info.manv,
          report_id: report.stt,
          yeu_thich: is_fav ? '0' : '1'
        }]),
      });
    } catch (err) {
      console.error('toggle_favorite error', err);
      // Rollback on error
      set_reports(prev => prev.map(r =>
        r.stt === report.stt ? { ...r, yeu_thich: is_fav ? '1' : '0' } : r
      ));
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        user_info,
        user_hr_info,
        login_text,
        login_loading,
        reports,
        filter_reports,
        report_id,
        report_param,
        shared,
        loading,
        rp_screen,
        login_user,
        logout_user,
        fetch_reports,
        fetch_filter_reports,
        fetch_filter_reports_rt,
        clear_filter_report,
        toggle_favorite,
        user_logger,
        set_rp_screen,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export default FeedbackContext;
