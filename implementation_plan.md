# Kế hoạch tích hợp Tính năng Chụp hình & Zoom cho 2 Báo cáo Native

Yêu cầu: Tích hợp tính năng Zoom 2 ngón (Pinch Zoom), Kéo rê 1 ngón (Pan Gesture) khi zoom, HUD hiển thị phần trăm zoom và nút Chụp màn hình (kéo thả được) tương tự như ở bản WebView cho 2 báo cáo dạng Native (`CRMOverallDashboard_2001` và `DeliveryPerformance_2002`).

## Phương án đề xuất

Thay vì viết lại logic cử chỉ trong từng file báo cáo native đơn lẻ, chúng ta sẽ viết logic này trực tiếp ở file route wrapper chính cho báo cáo Native: [src/app/report/native/[id].tsx](file:///d:/django_apps/rest/fontendapp/src/app/report/native/[id].tsx).

Bằng cách này:
- Cả hai báo cáo native (và các báo cáo native được thêm sau này) sẽ tự động thừa hưởng toàn bộ tính năng zoom và chụp ảnh.
- Dễ dàng bảo trì và tối ưu mã nguồn tập trung tại một nơi.
- Để tránh xung đột cử chỉ kéo (Pan) khi zoom với tính năng cuộn dọc của `ScrollView` mặc định trong các báo cáo native, chúng ta sẽ truyền prop `scrollEnabled={zoom_level <= 1.01}` từ wrapper xuống báo cáo native.

## Các thay đổi chi tiết

---

### [Component Wrapper Màn hình Native]

#### [MODIFY] [src/app/report/native/[id].tsx](file:///d:/django_apps/rest/fontendapp/src/app/report/native/[id].tsx)
- Import thêm các thư viện phục vụ cử chỉ & chụp màn hình: `react-native-gesture-handler`, `react-native-reanimated`, `react-native-view-shot`, `expo-sharing`.
- Tích hợp state `zoom_level`, các `useSharedValue` quản lý vị trí zoom focal, pan x/y, và vị trí draggable của nút camera.
- Triển khai GestureDetector quản lý đồng thời Pinch và Pan khi `zoom_level > 1.01`.
- Triển khai GestureDetector kéo thả cho nút Chụp ảnh.
- Áp dụng `animated_container_style` cho container hiển thị báo cáo.
- Render thêm HUD hiển thị phần trăm Zoom hiện tại.
- Truyền prop `scrollEnabled={zoom_level <= 1.01}` cho Component báo cáo.

---

### [Các Báo cáo Native]

#### [MODIFY] [src/components/native_reports/CRMOverallDashboard_2001.tsx](file:///d:/django_apps/rest/fontendapp/src/components/native_reports/CRMOverallDashboard_2001.tsx)
- Khai báo prop `scrollEnabled` (mặc định bằng `true`) cho component `CRMOverallDashboard_2001`.
- Gán prop `scrollEnabled={scrollEnabled}` cho phần tử root `<ScrollView>`.

#### [MODIFY] [src/components/native_reports/DeliveryPerformance_2002.tsx](file:///d:/django_apps/rest/fontendapp/src/components/native_reports/DeliveryPerformance_2002.tsx)
- Khai báo prop `scrollEnabled` (mặc định bằng `true`) cho component `DeliveryPerformance_2002`.
- Gán prop `scrollEnabled={scrollEnabled}` cho phần tử root `<ScrollView>`.

---

## Kế hoạch kiểm thử & Xác minh

### Kiểm thử thủ công
1. Mở màn hình Native Report (chọn "CRM Overall Dashboard" hoặc "Delivery Performance" trên trang chủ).
2. Thực hiện Pinch Zoom bằng 2 ngón tay xem màn hình báo cáo có phóng to/thu nhỏ mượt mà hay không.
3. Khi đang zoom lớn, kéo 1 ngón tay xem có dịch chuyển được góc nhìn báo cáo không (và đảm bảo `ScrollView` không cuộn loạn xạ).
4. Kiểm tra xem HUD hiển thị `% Zoom` ở giữa phía trên có xuất hiện mượt mà khi zoom và ẩn đi khi quay lại tỉ lệ `100%` hay không.
5. Nhấp vào nút Camera nổi trên màn hình (thử kéo thả nó sang các góc khác nhau) để chụp ảnh và chia sẻ báo cáo native.
