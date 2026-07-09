# 🔔 Push Notification KPI Implementation Tasks

- [x] **Backend Django**
  - [x] Tạo 6 API endpoints trong `local_views.py` và `local_urls.py`
  - [x] Test mock data cho MANV MR1077

- [x] **Frontend - Storage & Utils**
  - [x] Tạo `src/storage/notification.ts` để lưu push token local
  - [x] Tạo `src/utils/notifications.ts` xử lý logic xin permission và đăng ký device

- [x] **Frontend - State Management**
  - [x] Tạo `src/context/NotificationContext.tsx` (quản lý list, unread count, actions)

- [x] **Frontend - UI & Navigation**
  - [x] Tạo màn hình `src/app/(tabs)/notifications.tsx` (Notification Center)
  - [x] Cập nhật `src/app/(tabs)/_layout.tsx` thêm tab "Thông báo"
  - [x] Cập nhật `src/components/CustomHeader.tsx` thêm bell icon
  - [x] Cập nhật `src/app/(tabs)/index.tsx` thêm bell icon

- [x] **Frontend - Integration**
  - [x] Wrap `NotificationProvider` trong `src/app/_layout.tsx`
  - [x] Tích hợp đăng ký push token lúc login và xóa lúc logout trong `FeedbackContext.tsx`
