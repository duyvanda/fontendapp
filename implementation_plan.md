# Implementation Plan: Sửa lỗi không Back về Trang chủ `/(tabs)` khi mở báo cáo từ Killed State

## Mô tả sự cố
Khi mở ứng dụng từ Killed State qua Push Notification:
- Gatekeeper `index.tsx` sử dụng `router.replace('/report/[id]')` thay thế màn hình Splash thành màn hình Báo cáo.
- Do đó, stack điều hướng chỉ có 1 màn hình duy nhất (`/report/[id]`), khiến `router.canGoBack()` trả về `false`.
- Nút Back trên header khi `canGoBack() === false` lại điều hướng về `'/'` (`index.tsx` - màn hình Splash), gây ra vòng lặp tải lại ứng dụng hoặc không về được Trang chủ `/(tabs)`.

---

## Proposed Changes

### Gatekeeper & Router

#### [MODIFY] [index.tsx](file:///d:/django_apps/rest/fontendapp/src/app/index.tsx)
- Cập nhật hàm `navigate_with_fade`: Khi route mục tiêu là một đường dẫn báo cáo (deep link từ Killed state), sẽ thực hiện:
  1. `router.replace('/(tabs)')` để đưa màn hình Trang chủ vào làm trang gốc của Navigation Stack.
  2. `router.push(target_route)` để đưa màn hình Báo cáo lên trên.
- Nhờ vậy, nút Back chuẩn của hệ thống (Android hardware back) và nút Back trên Header đều nhận diện được `canGoBack() === true` và lùi về `/(tabs)` mượt mà.

### Components & Report Screens

#### [MODIFY] [CustomHeader.tsx](file:///d:/django_apps/rest/fontendapp/src/components/CustomHeader.tsx)
- Cập nhật fallback nút Back: Nếu `!router.canGoBack()`, thay vì `router.replace('/')` (về Splash), chuyển thành `router.replace('/(tabs)')` để quay thẳng về Trang chủ.

#### [MODIFY] [native/[id].tsx](file:///d:/django_apps/rest/fontendapp/src/app/report/native/%5Bid%5D.tsx)
- Cập nhật fallback nút Back trong Header báo cáo Native: Thay `router.replace('/')` thành `router.replace('/(tabs)')`.

---

## Verification Plan

### Automated Tests
- Chạy kiểm tra TypeScript `npx tsc --noEmit` $\rightarrow$ Đảm bảo 0 lỗi.

### Manual Verification
- Giả lập luồng Killed state (mở ứng dụng qua deep link báo cáo) $\rightarrow$ Kiểm tra khi bấm nút Back trên Header hoặc phím Back phần cứng Android, ứng dụng quay lại Trang chủ `/(tabs)` đúng như kỳ vọng.
