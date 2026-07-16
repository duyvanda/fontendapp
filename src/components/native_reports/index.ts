import React from 'react';
import CRMOverallDashboard_2001 from './CRMOverallDashboard_2001';
import HROverview_2002 from './HROverview_2002';

// Bảng ánh xạ stt (report_id) sang Component tương ứng
export const NATIVE_REPORTS_MAP: Record<string, React.ComponentType<{ scrollEnabled?: boolean }>> = {
  '2001': CRMOverallDashboard_2001,
  '2002': HROverview_2002,
};

export {
  CRMOverallDashboard_2001,
  HROverview_2002
};
