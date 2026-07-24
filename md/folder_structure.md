# 📂 Cấu Trúc Dự Án Chi Tiết (Detailed Project Structure) — `fontendapp`

Tài liệu mô tả toàn bộ cấu trúc thư mục và chi tiết từng file mã nguồn trong dự án Mobile (React Native / Expo Router).

---

```text
fontendapp/
├── apple review/              <-- Tài liệu & Ảnh chụp màn hình chuẩn bị cho Apple Review (Tóm tắt)
├── assets/                    <-- Tài nguyên hình ảnh & App Icon hệ thống (Tóm tắt)
├── md/                        <-- Tài liệu kĩ thuật & Hướng dẫn luồng tính năng (Tóm tắt)
│
├── sql/                       <-- Các script & hàm Stored Functions PostgreSQL
│   ├── expo_push_token_register.sql     <-- Hàm đăng ký Push Token + Device Info
│   ├── expo_push_token_unregister.sql   <-- Hàm hủy Push Token khi Logout
│   └── expo_push_tokens.sql             <-- Bảng lưu trữ Push Tokens
│
├── src/                       <-- MÃ NGUỒN CHÍNH CỦA ỨNG DỤNG
│   ├── app/                   <-- Màn hình & Routing (Expo Router - File-based Routing)
│   │   ├── (tabs)/            <-- Các Tab trong Bottom Navigation Bar
│   │   │   ├── _layout.tsx    <-- Cấu hình Tab Bar (Icons, Labels, Colors)
│   │   │   ├── apps.tsx       <-- Tab Ứng dụng / Công cụ mở rộng
│   │   │   ├── bira.tsx       <-- Tab Trợ lý ảo AI BIRA
│   │   │   ├── index.tsx      <-- Tab Trang chủ (Danh sách báo cáo, Tìm kiếm, Yêu thích)
│   │   │   └── notifications.tsx <-- Tab Danh sách Thông báo hệ thống
│   │   │
│   │   ├── realtime/          <-- Báo cáo Thời gian thực (Realtime)
│   │   │   └── [id].tsx       <-- Màn hình xem báo cáo Realtime (kèm Modal nhập tham số)
│   │   │
│   │   ├── report/            <-- Màn hình Xem Báo cáo
│   │   │   ├── [id].tsx       <-- Xem Báo cáo mặc định (Webview Looker Studio)
│   │   │   ├── ton-kho-toc-do-ban.tsx <-- Báo cáo Tồn kho & Tốc độ bán
│   │   │   └── native/
│   │   │       └── [id].tsx   <-- Xem Báo cáo dạng Native UI (React Native Charts)
│   │   │
│   │   ├── _layout.tsx        <-- Root Layout (Cấu hình Stack Navigation, OTA Check, Notifications Handler)
│   │   ├── account.tsx        <-- Màn hình Cài đặt tài khoản & Xóa tài khoản (Account Deletion)
│   │   ├── index.tsx          <-- Màn hình Splash Gatekeeper (Kiểm tra session Auth & Fade-out)
│   │   ├── login.tsx          <-- Màn hình Đăng nhập (Auto-focus email, Tenant mặc định)
│   │   └── terms.tsx          <-- Màn hình Điều khoản dịch vụ & Chính sách bảo mật
│   │
│   ├── components/            <-- Các UI Components tái sử dụng
│   │   ├── CloudAssist/       <-- Component Trợ lý ảo AI BIRA
│   │   │   ├── index.tsx      <-- Giao diện Chat, Nhận diện giọng nói & Chụp ảnh đính kèm
│   │   │   └── styles.ts      <-- Stylesheet riêng cho BIRA Assist
│   │   │
│   │   ├── native_reports/    <-- Các Báo cáo hiển thị bằng Native Code
│   │   │   ├── CRMOverallDashboard_2001.tsx <-- Báo cáo Tổng quan CRM (Mã 2001)
│   │   │   ├── HROverview_2002.tsx          <-- Báo cáo Nhân sự / HR Overview (Mã 2002)
│   │   │   └── index.ts                     <-- Map mã báo cáo Native (NATIVE_REPORTS_MAP)
│   │   │
│   │   ├── CustomHeader.tsx   <-- Header chung (Tiêu đề, Nút quay lại, Nút đóng)
│   │   ├── ReportWebView.tsx  <-- Component nhúng Webview Báo cáo (Pinch Zoom, Chụp hình, Progress bar)
│   │   └── ReportWebView_rules.md <-- Quy tắc phát triển ReportWebView
│   │
│   ├── context/               <-- Quản lý State toàn cục (React Context API)
│   │   ├── FeedbackContext.tsx    <-- Quản lý Auth, User Info, Danh sách Reports, Thao tác Yêu thích
│   │   └── NotificationContext.tsx <-- Quản lý Push Token, Đếm Unread, Polling 60s & Deep-linking
│   │
│   ├── storage/               <-- Các hàm thao tác với AsyncStorage local
│   │   ├── auth.ts            <-- Lưu & xóa thông tin Đăng nhập (User Info)
│   │   ├── chat.ts            <-- Lưu lịch sử hội thoại Chat với BIRA
│   │   └── notification.ts    <-- Lưu & xóa Push Token cục bộ
│   │
│   ├── styles/                <-- Hệ thống thiết kế (Design Tokens)
│   │   └── global.ts          <-- Bảng màu (colors), Spacing, Border Radius, Layout Styles
│   │
│   └── utils/                 <-- Utility functions & API Endpoint config
│       ├── api.ts             <-- Khai báo domain API (`LOCALURL`)
│       └── string.ts          <-- Utils định dạng ngày tháng, tiền tệ, xử lý chuỗi
│
├── .easignore                 <-- Danh sách bỏ qua khi build bằng EAS
├── .gitignore                 <-- Danh sách bỏ qua khi Commit Git
├── AGENTS.md                  <-- Quy chuẩn phát triển & hướng dẫn kỹ thuật cho AI Agent
├── CLAUDE.md                  <-- Cấu hình môi trường Claude
├── LICENSE                    <-- Giấy phép bản quyền mã nguồn
├── UI UX.md                   <-- Tài liệu nguyên tắc thiết kế Giao diện & Trải nghiệm
├── app.json                   <-- Cấu hình Expo Project (App ID, Permissions, iOS Deployment Target 15.2...)
├── eas.json                   <-- Cấu hình các Profile Build & Release (Preview, Production)
├── expo-env.d.ts              <-- TypeScript declaration file cho Expo
├── package.json               <-- Danh sách thư viện Dependencies & Scripts
├── package-lock.json          <-- Lockfile chi tiết phiên bản Dependencies
└── tsconfig.json              <-- Cấu hình TypeScript Compiler
```
