# 📂 Cấu Trúc Dự Án (Project Structure) — `fontendapp`

Tài liệu mô tả chi tiết cấu trúc cây thư mục và vai trò của các thành phần trong ứng dụng Mobile (React Native / Expo Router).

---

```text
fontendapp/
├── assets/                    <-- Chứa tài nguyên tĩnh (Images, Fonts, Icons)
├── md/                        <-- Tài liệu kĩ thuật, hướng dẫn & luồng tính năng
│   ├── NOTIFICATION_FLOW.md   <-- Sơ đồ & Tài liệu chi tiết luồng Push Notification
│   ├── cleanup_guide.md       <-- Hướng dẫn dọn dẹp bộ nhớ/cache
│   ├── guide_push_notification_test.md
│   └── implementation_OTA.md  <-- Hướng dẫn triển khai Cập nhật OTA (Expo Updates)
│
├── sql/                       <-- Các hàm Stored Functions & Scripts PostgreSQL
│
├── src/                       <-- Mã nguồn chính của ứng dụng
│   ├── app/                   <-- Màn hình & Routing (Expo Router - File-based Routing)
│   │   ├── (tabs)/            <-- Các màn hình chính trong Bottom Navigation Bar
│   │   │   ├── index.tsx      <-- Tab Trang chủ (Danh sách báo cáo)
│   │   │   ├── notifications.tsx <-- Tab Thông báo hệ thống
│   │   │   └── user.tsx       <-- Tab Thông tin cá nhân
│   │   ├── realtime/          <-- Định tuyến màn hình Báo cáo Thời gian thực (Realtime)
│   │   ├── report/            <-- Định tuyến màn hình Xem Báo cáo (Webview & Native)
│   │   │   └── native/        <-- Định tuyến riêng cho Báo cáo Native
│   │   ├── _layout.tsx        <-- Root Layout, cấu hình Notifications Handler & Context Providers
│   │   ├── account.tsx        <-- Màn hình Quản lý tài khoản
│   │   ├── index.tsx          <-- Màn hình Splash Gatekeeper (Kiểm tra session auth & điều hướng)
│   │   ├── login.tsx          <-- Màn hình Đăng nhập
│   │   └── terms.tsx          <-- Màn hình Điều khoản & Chính sách sử dụng
│   │
│   ├── components/            <-- Các UI Components tái sử dụng
│   │   ├── CloudAssist/       <-- Trợ lý ảo AI BIRA (Chat & Voice UI)
│   │   ├── native_reports/    <-- Danh sách các Báo cáo dạng Native React Native UI
│   │   ├── CustomHeader.tsx   <-- Header chung toàn ứng dụng
│   │   └── ReportWebView.tsx  <-- Component hiển thị Báo cáo Iframe/Webview với các tối ưu hoá
│   │
│   ├── context/               <-- Quản lý State toàn cục bằng React Context API
│   │   ├── FeedbackContext.tsx    <-- State Auth (user_info), danh sách reports & API fetchers
│   │   └── NotificationContext.tsx <-- State Thông báo, đếm số unread, Push Token & Deep-linking
│   │
│   ├── storage/               <-- Các hàm tương tác với AsyncStorage local
│   │   ├── auth.ts            <-- Lưu/xóa token và thông tin người dùng
│   │   ├── chat.ts            <-- Lưu lịch sử trò chuyện AI BIRA
│   │   └── notification.ts    <-- Lưu/xóa Push Token local
│   │
│   ├── styles/                <-- Thiết kế hệ thống (Design System)
│   │   └── global.ts          <-- Bảng màu (Colors), Spacing, Radius & Global styles
│   │
│   └── utils/                 <-- Utility functions & API Config
│       ├── api.ts             <-- Cấu hình URL endpoint Backend
│       └── string.ts          <-- Utils xử lý chuỗi, định dạng ngày tháng, tiền tệ
│
├── AGENTS.md                  <-- Quy tắc & hướng dẫn kĩ thuật phát triển cho AI Agent
├── app.json                   <-- Cấu hình Expo Project (App Name, Splash, Deep-link, Plugins...)
├── eas.json                   <-- Cấu hình EAS Build & Update profiles
├── package.json               <-- Danh sách thư viện dependencies & scripts
└── tsconfig.json              <-- Cấu hình TypeScript
```
