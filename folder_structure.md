# 📂 Cấu trúc thư mục Dự án BIRA App

Dưới đây là cấu trúc tổ chức mã nguồn của toàn bộ ứng dụng:

```text
src/
├── app/                             <-- Hệ thống chuyển trang (File-based Routing)
│   ├── _layout.tsx                  <-- Root Layout (Bọc FeedbackProvider, ẩn Header gốc)
│   ├── index.tsx                    <-- Màn hình Entry/Redirect tự động
│   ├── login.tsx                    <-- Màn hình Đăng nhập (Full Screen)
│   ├── terms.tsx                    <-- Màn hình Điều khoản & Chính sách (Terms & Privacy)
│   │
│   ├── (tabs)/                      <-- Nhóm Màn hình chính (Có Tab Bar dưới đáy)
│   │   ├── _layout.tsx              <-- Định nghĩa 3 tabs chính dưới màn hình (Home, BIRA, Apps)
│   │   ├── index.tsx                <-- Màn hình Home (Dashboard, danh sách báo cáo)
│   │   ├── bira.tsx                 <-- Tab phụ kích hoạt Trợ lý ảo
│   │   ├── apps.tsx                 <-- Tab Ứng dụng & Công cụ (Link ngoài)
│   │   └── notifications.tsx        <-- [NEW] Tab Trung tâm Thông báo (Cảnh báo KPI)
│   │
│   ├── report/                      <-- Nhóm màn hình xem báo cáo tĩnh (Ngoài tabs để ẨN Tab Bar)
│   │   ├── [id].tsx                 <-- Màn hình xem Report tĩnh (Tương đương /reportscreen/:id)
│   │   └── ton-kho-toc-do-ban.tsx   <-- [NEW] File code riêng cho báo cáo "Tồn kho & Tốc độ bán"
│   │
│   └── realtime/                    <-- Nhóm màn hình xem báo cáo Realtime
│       └── [id].tsx                 <-- Màn hình xem Realtime (Có popup cấu hình tham số báo cáo)
│
├── components/                      <-- Các Component tái sử dụng
│   ├── CloudAssist/
│   │   ├── index.tsx                <-- Trợ lý ảo AI BIRA (Dùng Modal/BottomSheet thay vì Offcanvas)
│   │   └── styles.ts                <-- StyleSheet riêng cho trợ lý ảo
│   ├── ReportWebView.tsx            <-- Component nhúng báo cáo (Thay thế cho <iframe> của Web)
│   └── CustomHeader.tsx             <-- Header tự thiết kế cho màn hình báo cáo
│
├── context/                         <-- Quản lý State toàn cục bằng Context API
│   ├── FeedbackContext.tsx          <-- Chứa logic fetch_filter_reports, user_info, logger...
│   └── NotificationContext.tsx      <-- [NEW] Quản lý State & API của thông báo (Push & Unread)
│
├── storage/                         <-- Quản lý bộ nhớ tạm (Local Storage)
│   ├── auth.ts                      <-- Lưu thông tin user_info đăng nhập
│   ├── chat.ts                      <-- Lưu tin nhắn của BIRA vào AsyncStorage
│   └── notification.ts              <-- [NEW] Lưu trữ Expo Push Token tạm thời
│
├── utils/                           <-- Hàm bổ trợ tiện ích
│   ├── api.ts                       <-- Cấu hình fetch API (cho chat, markdown, reports)
│   ├── string.ts                    <-- Xử lý chuỗi, định dạng ngày tháng
│   └── notifications.ts             <-- [NEW] Xử lý xin quyền & API đăng ký Expo Push Token
│
└── styles/                          <-- Theme và Styles chung
    └── global.ts                    <-- Màu sắc (colors), kiểu chữ chung của app
```