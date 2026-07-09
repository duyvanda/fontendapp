/**
 * FeedbackContext — Core state management cho BI Portal.
 * Port từ frontend1/src/context/FeedbackContext.js
 * Thay thế: localStorage → AsyncStorage, window.* → Dimensions
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

import { LOCALURL, REPORTS_API_URL, API_BASE_URL } from '@/utils/api';
import { get_version } from '@/utils/string';
import {
  saveUserInfo,
  getUserInfo,
  saveUserHrInfo,
  getUserHrInfo,
  saveReportsList,
  getReportsList,
  clearAllAuth,
  UserInfo,
  UserHrInfo,
} from '@/storage/auth';

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
  user_info: UserInfo | null;
  user_hr_info: UserHrInfo | null;
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
  const [user_info, set_user_info] = useState<UserInfo | null>(null);
  const [user_hr_info, set_user_hr_info] = useState<UserHrInfo | null>(null);
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
      const stored_user = await getUserInfo();
      const stored_hr = await getUserHrInfo();
      if (stored_user) {
        set_user_info(stored_user);
        if (stored_hr) set_user_hr_info(stored_hr);
        await fetch_reports(stored_user.manv);
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
        await saveUserInfo(data);
        set_user_info(data);
        await fetch_reports(data.manv);
      }
    } catch (err) {
      set_login_text('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      set_login_loading(false);
    }
  };

  // ── Auth: Logout ───────────────────────────────────────────────────────────
  const logout_user = async () => {
    await clearAllAuth();
    set_user_info(null);
    set_user_hr_info(null);
    set_reports([]);
    set_filter_reports(null);
    set_login_text('');
    router.replace('/login');
  };

  // ── Reports: Fetch danh sách reports của user ──────────────────────────────
  const fetch_reports = async (manv: string) => {
    try {
      const response = await fetch(`${REPORTS_API_URL}?manv=${manv}`);
      const responseText = await response.text();
      // Replace http with https for any hardcoded backend URLs
      const replacedText = responseText.replace(/http:\/\/bi\.meraplion\.com/g, 'https://bi.meraplion.com');
      const data = JSON.parse(replacedText);
      const raw_reports: Report[] = data['rows_data'] || [];
      const lstreports = raw_reports.map((el) => ({ ...el, manv }));
      set_reports(lstreports);
      await saveReportsList(lstreports);

      if (data['user_hr_info']) {
        await saveUserHrInfo(data['user_hr_info']);
        set_user_hr_info(data['user_hr_info']);
      }
    } catch (err) {
      console.error('fetch_reports error:', err);
      // Load from cache nếu offline
      const cached = await getReportsList();
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
        user_logger,
        set_rp_screen,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export default FeedbackContext;
