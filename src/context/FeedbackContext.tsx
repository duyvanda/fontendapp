/**
 * FeedbackContext — Core state management cho BI Portal.
 * Port từ frontend1/src/context/FeedbackContext.js
 * Thay thế: localStorage → AsyncStorage, window.* → Dimensions
 */
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
import { API_BASE_URL, LOCALURL, REPORTS_API_URL, apiFetch } from '@/utils/api';
import { get_version } from '@/utils/string';
import { get_push_token, remove_push_token } from '@/storage/notification';
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
  tags?: string[];
  index?: number;
}

interface FeedbackContextValue {
  // Auth state
  user_info: user_info_type | null;
  user_hr_info: user_hr_info_type | null;
  login_text: string;
  login_loading: boolean;
  initialized: boolean;
  // Report state
  reports: Report[];
  filter_reports: Report | null;
  report_id: string;
  report_param: string;
  shared: boolean;
  loading: boolean;
  rp_screen: boolean;
  // Actions
  login_user: (data: { email: string; password: string; tenant_id?: string }) => Promise<void>;
  logout_user: () => Promise<void>;
  fetch_reports: (manv: string) => Promise<void>;
  fetch_filter_reports: (stt: string, isMB: boolean) => void;
  fetch_filter_reports_rt: (stt: string, isMB: boolean, filter_data: Record<string, unknown>) => Promise<void>;
  clear_filter_report: () => void;
  user_logger: (manv: string, id: string, isMB: boolean, dv_width: number, device_info: any) => void;
  set_rp_screen: (val: boolean) => void;
  toggle_favorite: (report: Report) => Promise<void>;
  save_tags: (report: Report, tags: string[]) => Promise<void>;
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
  const [initialized, set_initialized] = useState(false);

  // Report state
  const [reports, set_reports] = useState<Report[]>([]);
  const [filter_reports, set_filter_reports] = useState<Report | null>(null);
  const [report_id, set_report_id] = useState('');
  const [report_param, set_report_param] = useState('');
  const [shared, set_shared] = useState(true);
  const [loading, set_loading] = useState(false);
  const [rp_screen, set_rp_screen] = useState(false);

  // ── Reports: Fetch danh sách reports của user ──────────────────────────────
  const fetch_reports = useCallback(async (manv: string) => {
    const parse_tags = (tagsVal: any): string[] => {
      if (!tagsVal) return [];
      if (Array.isArray(tagsVal)) return tagsVal;
      if (typeof tagsVal === 'string') {
        try {
          const parsed = JSON.parse(tagsVal);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    try {
      const data = await apiFetch<any>(`${REPORTS_API_URL}?manv=${manv}&is_app=1`);

      const raw_reports: Report[] = data['rows_data'] || [];
      const lstreports = raw_reports.map((el) => {
        // Optimize: Chỉ thay thế URL ở trường link_report thay vì toàn bộ chuỗi JSON lớn
        const link_report = el.link_report 
          ? el.link_report.replace(/http:\/\/bi\.meraplion.com/g, 'https://bi.meraplion.com') 
          : el.link_report;

        return {
          ...el,
          link_report,
          tenreport: el.tenreport, // Đã xóa hardcode 'HR Overview'
          manv,
          tags: parse_tags(el.tags),
          index: el.index !== undefined ? Number(el.index) : undefined
        };
      });
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
      if (cached.length > 0) {
        const parsedCached = (cached as Report[]).map((el) => ({
          ...el,
          tenreport: el.tenreport, // Đã xóa hardcode 'HR Overview'
          tags: parse_tags(el.tags),
          index: el.index !== undefined ? Number(el.index) : undefined
        }));
        set_reports(parsedCached);
      }
    }
  }, []);

  // ── Init: Hydrate user + reports từ AsyncStorage khi app khời động ──────────────
  useEffect(() => {
    let is_mounted = true;

    (async () => {
      let stored_user: user_info_type | null = null;
      let has_cached_reports = false;

      try {
        const [
          stored_user_data,
          stored_hr,
          cached_reports,
        ] = await Promise.all([
          get_user_info(),
          get_user_hr_info(),
          get_reports_list(),
        ]);

        if (!is_mounted) {
          return;
        }

        stored_user = stored_user_data;

        // 1. Hydrate user trước
        if (stored_user) {
          set_user_info(stored_user);
        }

        if (stored_hr) {
          set_user_hr_info(stored_hr);
        }

        // 2. Hydrate reports từ cache ngay lập tức
        if (
          Array.isArray(cached_reports) &&
          cached_reports.length > 0
        ) {
          set_reports(cached_reports as Report[]);
          has_cached_reports = true;
        }

        // 3. Nếu không có cache nhưng user đã đăng nhập,
        // cần fetch server trước khi cho app initialized.
        if (stored_user && !has_cached_reports) {
          await fetch_reports(stored_user.manv);
        }
      } catch (error) {
        console.error(
          '[FeedbackContext] Initial hydration error:',
          error,
        );
      } finally {
        if (is_mounted) {
          set_initialized(true);
        }
      }

      // 4. Nếu đã có cache:
      // cho UI dùng cache ngay, refresh server chạy background.
      if (
        is_mounted &&
        stored_user &&
        has_cached_reports
      ) {
        void fetch_reports(stored_user.manv);
      }
    })();

    return () => {
      is_mounted = false;
    };
  }, [fetch_reports]);



  // ── Auth: Login ────────────────────────────────────────────────────────────
  const login_user = useCallback(async (logindata: { email: string; password: string; tenant_id?: string }) => {
    set_login_loading(true);
    set_login_text('');
    try {
      const data = await apiFetch<any>(`${API_BASE_URL}/loginv1/`, {
        method: 'POST',
        body: JSON.stringify(logindata),
      });
      await save_user_info(data);
      set_user_info(data);
      await fetch_reports(data.manv);
      // Tạm thời tắt đăng ký Push Notification
      // registerForPushNotificationsAsync(data.manv);
    } catch (err: any) {
      set_login_text(err.message || 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      set_login_loading(false);
    }
  }, [fetch_reports]);

  // ── Auth: Logout ───────────────────────────────────────────────────────────
  const logout_user = useCallback(async () => {
    // 1. Hủy đăng ký Push Token trước khi xóa dữ liệu user
    if (user_info?.manv) {
      const push_token = await get_push_token();
      if (push_token) {
        try {
          await fetch(`${LOCALURL}/post_data/expo_push_token_unregister/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{ manv: user_info.manv, token: push_token }]),
          });
        } catch (error) {
          console.error('Lỗi khi unregister push token lúc logout:', error);
        } finally {
          // Xóa token local để tránh giữ token cũ
          await remove_push_token();
        }
      }
    }

    // 2. Xóa toàn bộ dữ liệu phiên
    await clear_all_auth();
    set_user_info(null);
    set_user_hr_info(null);
    set_reports([]);
    set_filter_reports(null);
    set_login_text('');

    router.replace('/login');
  }, [user_info?.manv]);


  // ── Reports: Filter report tĩnh (Looker Studio embed trực tiếp) ────────────
  const fetch_filter_reports = useCallback((stt: string, isMB: boolean) => {
    const manv = user_info?.manv || '';
    const manv_int_0 = manv.replace(/MR/g, '11');
    // Lọc theo cả stt và manv để đảm bảo phân quyền đúng báo cáo của user này
    const filtered = reports.filter((el) => el.stt === stt && el.manv === manv);
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
          rppr.replace(/xxxxxx/g, manv).replace(/vvvvvv/g, manv_int_0),
        );
      } else if (report_obj.type === 5) {
        const final_link = (report_obj.link_report || '').replace(/xxxxxx/g, manv);
        set_report_param(final_link);
      } else {
        set_report_param(rppr.replace(/xxxxxx/g, 'MR0000'));
      }
    } else {
      set_shared(false);
    }
  }, [reports, user_info?.manv]);

  // ── Reports: Fetch realtime report ─────────────────────────────────────────
  const fetch_real_time_report = useCallback(async (
    data_user: Record<string, unknown>,
    local_url: string,
    rppr: string,
  ) => {
    set_shared(false);
    set_loading(true);
    try {
      await apiFetch(`${LOCALURL}/${local_url}/`, {
        method: 'POST',
        body: JSON.stringify(data_user),
      });
      set_report_param(
        rppr
          .replace(/xxxxxx/g, data_user.manv as string)
          .replace(/vvvvvv/g, data_user.version as string),
      );
      set_shared(true);
    } catch (err) {
      console.error('fetch_real_time_report error:', err);
      set_shared(false);
    } finally {
      set_loading(false);
    }
  }, []);

  const fetch_filter_reports_rt = useCallback(async (
    stt: string,
    isMB: boolean,
    filter_data: Record<string, unknown>,
  ) => {
    try {
      const manv = user_info?.manv || '';
      const report_obj = reports.find((el) => el.stt === stt && el.manv === manv);
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
  }, [reports, user_info?.manv, fetch_real_time_report]);

  // ── Reports: Clear filter ──────────────────────────────────────────────────
  const clear_filter_report = useCallback(() => {
    set_filter_reports(null);
  }, []);

  // ── Logger ─────────────────────────────────────────────────────────────────
  const user_logger = useCallback((
    manv: string,
    id: string,
    isMB: boolean,
    dv_width: number,
    device_info: any,
  ) => {
    apiFetch(`${API_BASE_URL}/userreportlogger/`, {
      method: 'POST',
      body: JSON.stringify({ manv, id, ismb: isMB, dv_width, device_info }),
    }).catch(() => void 0); // Fire and forget
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  const toggle_favorite = useCallback(async (report: Report) => {
    if (!user_info?.manv) return;
    const is_fav = report.yeu_thich && String(report.yeu_thich) !== '0';
    const next_fav = is_fav ? '0' : '1';

    // Optimistic update + Sync AsyncStorage
    set_reports(prev => {
      const next = prev.map(r => r.stt === report.stt ? { ...r, yeu_thich: next_fav } : r);
      save_reports_list(next).catch(() => void 0);
      return next;
    });

    try {
      await apiFetch(`${LOCALURL}/post_data/insert_report_user_prefs_fav/`, {
        method: 'POST',
        body: JSON.stringify([{
          manv: user_info.manv,
          report_id: report.stt,
          yeu_thich: next_fav
        }]),
      });
    } catch (err) {
      console.error('toggle_favorite error', err);
      // Rollback on error
      set_reports(prev => {
        const next = prev.map(r => r.stt === report.stt ? { ...r, yeu_thich: is_fav ? '1' : '0' } : r);
        save_reports_list(next).catch(() => void 0);
        return next;
      });
    }
  }, [user_info?.manv]);

  const save_tags = useCallback(async (report: Report, tags: string[]) => {
    if (!user_info?.manv) return;

    // Optimistic update + Sync AsyncStorage
    set_reports(prev => {
      const next = prev.map(r => r.stt === report.stt ? { ...r, tags } : r);
      save_reports_list(next).catch(() => void 0);
      return next;
    });

    try {
      await apiFetch(`${LOCALURL}/post_data/insert_report_user_prefs_tags/`, {
        method: 'POST',
        body: JSON.stringify([{
          manv: user_info.manv,
          report_id: report.stt,
          tags
        }]),
      });
    } catch (err) {
      console.error('save_tags error:', err);
      // Rollback on error
      set_reports(prev => {
        const next = prev.map(r => r.stt === report.stt ? { ...r, tags: report.tags || [] } : r);
        save_reports_list(next).catch(() => void 0);
        return next;
      });
    }
  }, [user_info?.manv]);

  return (
    <FeedbackContext.Provider
      value={{
        user_info,
        user_hr_info,
        login_text,
        login_loading,
        initialized,
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
        save_tags,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export default FeedbackContext;
