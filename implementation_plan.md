# Implementation Plan: Sửa lỗi không Back về Trang chủ `/(tabs)` khi mở báo cáo từ Killed State (Chỉ xử lý Nút Back giao diện Header)

## Mô tả sự cố
Khi mở ứng dụng từ Killed State qua Push Notification:
- Màn hình Splash/Gatekeeper chuyển hướng trực tiếp bằng `router.replace` tới màn hình Báo cáo.
- Khi đó, stack điều hướng chỉ có 1 màn hình báo cáo, làm `router.canGoBack()` trả về `false`.
- Hiện trạng: Nút Back trên giao diện Header (của `CustomHeader` hoặc Header tự dựng trong báo cáo Native) đang gọi `router.replace('/')` (về màn hình Splash), gây ra vòng lặp tải/loading lại app không cần thiết.

## Giải pháp lựa chọn
- Cập nhật nút Back trên giao diện Header (nếu không thể back) sẽ chuyển hướng trực tiếp về trang chủ `/(tabs)` bằng `router.replace('/(tabs)')`.
- Chấp nhận hành vi mặc định của hệ điều hành: Khi bấm nút Back cứng của thiết bị (hoặc cử chỉ vuốt back hệ thống), ứng dụng sẽ thoát (do stack trống).

---

## Proposed Changes

### Components & Report Screens

#### [MODIFY] [CustomHeader.tsx](file:///d:/django_apps/rest/fontendapp/src/components/CustomHeader.tsx)
- Cập nhật fallback của nút Back trong component `CustomHeader` (dùng cho Báo cáo Tĩnh & Realtime):
  Thay đổi `router.replace('/')` thành `router.replace('/(tabs)')`.

#### [MODIFY] [native/[id].tsx](file:///d:/django_apps/rest/fontendapp/src/app/report/native/%5Bid%5D.tsx)
- Cập nhật fallback của nút Back trong Header tự dựng của Báo cáo Native:
  Thay đổi `router.replace('/')` thành `router.replace('/(tabs)')`.

---

## Verification Plan

### Automated Tests
- Chạy kiểm tra TypeScript `npx tsc --noEmit` $\rightarrow$ Đảm bảo 0 lỗi.

### Manual Verification
- Giả lập luồng Killed state (mở ứng dụng qua deep link báo cáo).
- Nhấp vào nút Back trên giao diện Header ở cả 3 loại báo cáo (Tĩnh, Realtime, Native) và xác nhận nó chuyển về Trang chủ `/(tabs)` trực tiếp mà không bị hiện spinner loading của Splash Screen.
