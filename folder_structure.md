src/
├── app/                             <-- Hệ thống chuyển trang (File-based Routing)
│   ├── _layout.tsx                  <-- Root Layout (Bọc FeedbackProvider, ẩn Header gốc)
│   ├── login.tsx                    <-- Màn hình Đăng nhập (Full Screen)
│   │
│   ├── (tabs)/                      <-- Nhóm Màn hình chính (Có Tab Bar dưới đáy)
│   │   ├── _layout.tsx              <-- Định nghĩa 3 tabs chính dưới màn hình
│   │   ├── index.tsx                <-- Màn hình Home (Dashboard)
│   │   └── reports.tsx              <-- Màn hình danh sách Reports (Thay cho Portal/ReportList)
│   │
│   └── report/                      <-- Nhóm màn hình xem báo cáo (Ngoài tabs để ẨN Tab Bar)
│       ├── [id].tsx                 <-- Màn hình xem Report tĩnh (Tương đương /reportscreen/:id)
│       ├── realtime-[id].tsx        <-- Màn hình xem Realtime (Tương đương /realtime/:id)
│       └── ton-kho-toc-do-ban.tsx    <-- [NEW] File code riêng cho báo cáo "Tồn kho & Tốc độ bán"
│
├── components/                      <-- Các Component tái sử dụng
│   ├── CloudAssist/
│   │   ├── index.tsx                <-- Trợ lý ảo AI BIRA (Dùng Modal/BottomSheet thay vì Offcanvas)
│   │   └── styles.ts                <-- StyleSheet riêng cho trợ lý ảo
│   ├── ReportWebView.tsx            <-- Component nhúng báo cáo (Thay thế cho <iframe> của Web)
│   └── CustomHeader.tsx             <-- Header tự thiết kế cho màn hình báo cáo
│
├── context/                         <-- Quản lý State toàn cục bằng Context API
│   └── FeedbackContext.tsx          <-- Chứa logic fetch_filter_reports, user_info, logger...
│
├── storage/                         <-- Quản lý bộ nhớ tạm (Local Storage)
│   ├── auth.ts                      <-- Lưu thông tin user_info đăng nhập
│   └── chat.ts                      <-- Lưu tin nhắn của BIRA vào AsyncStorage
│
├── utils/                           <-- Hàm bổ trợ tiện ích
│   ├── api.ts                       <-- Cấu hình fetch API (cho chat, markdown, reports)
│   └── string.ts                    <-- Xử lý chuỗi, định dạng ngày tháng
│
└── styles/                          <-- Theme và Styles chung
    └── global.ts                    <-- Màu sắc (colors), kiểu chữ chung của app