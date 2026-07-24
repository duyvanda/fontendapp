# Quy tắc ReportWebView.tsx (Chi tiết & Đầy đủ)

1. **Zoom 2 ngón an toàn (Pinch Zoom)**:
   * Chặn zoom mặc định của WebKit để tránh crash WebView.
   * Dùng Native `Gesture.Pinch()` + Reanimated scale UIView. Giới hạn `1.0` - `2.0` (100% - 200%).

2. **Kéo rê 1 ngón (Pan Gesture) khi Zoom**:
   * Chỉ kích hoạt (`enabled(zoom_level > 1.01)`) khi tỉ lệ zoom lớn hơn 100% để người dùng di chuyển góc nhìn.
   * Vô hiệu hóa ở mức `1.0` để người dùng chạm, click và cuộn trang Looker nội bộ bình thường.
   * Tự động trả về vị trí căn giữa (spring back to 0) khi phóng nhỏ về 100%.

3. **Chống lỗi CORS (Ẩn Footer & Menu)**:
   * Chuẩn hoá mọi URL về domain `lookerstudio.google.com` (thay vì `datastudio.google.com`).
   * Sử dụng `baseUrl: 'https://lookerstudio.google.com'` để đồng bộ Same-Origin, cho phép inject CSS và JS quét DOM sâu ẩn các thành phần thừa (Footer, Google Logo, Quyền riêng tư).

4. **Hiển thị % Zoom thông minh**:
   * Bố trí HUD báo % zoom ở giữa bên trên màn hình (độc lập với nút chụp).
   * HUD tự động Zoom to (`scale: 1.25`) + hiện lên khi zoom, và thu nhỏ (`scale: 0.6`) + ẩn đi khi đưa về 100% bằng Spring.

5. **Chụp ảnh màn hình WYSIWYG**:
   * Gán `ref={capture_view_ref}` ở thẻ View **bên ngoài** `Reanimated.View` (nơi chứa scale/pan transform).
   * Bấm nút sẽ chụp lại chính xác tỉ lệ phóng to/thu nhỏ hiện tại trên màn hình và gọi hộp thoại chia sẻ hệ thống.

6. **Skeleton Loading & Progress Animation**:
   * Thanh tiến trình chạy tự động từ `0%` đến `85%` trong 8 giây, kết hợp vòng lặp nhấp nháy (pulse animation) từ `0.3` đến `0.7` opacity mỗi 800ms.
   * Khi load xong (`handle_load_end`), thanh tiến trình phóng lên `100%` trong 300ms, rồi toàn bộ khung loading mờ dần về `0` trong 500ms.

7. **Xử lý đa nền tảng & Crash**:
   * **Web**: Nếu chạy trên Web, render trực tiếp thẻ `<iframe>` thông thường thay vì `WebView`.
   * **iOS Footer Mask**: Đè thêm một thanh màu trắng `height: 20` ở đáy WebView trên iOS để che đi các liên kết điều khoản ẩn dưới của Looker.
   * **WebView Process Crash**: Sử dụng `onContentProcessDidTerminate` để tăng `webview_key`, tự động reload lại WebView khi tiến trình của hệ điều hành bị sập.

8. **Kéo thả cụm nút tiện ích (2-trong-1)**:
   * Cụm nút bao gồm: Nút 1 (📸 Chụp ảnh) & Nút 2 (🔄 Xoay màn hình).
   * Có thể kéo thả tự do bằng cử chỉ Pan. Khi xoay ngang/dọc màn hình (`screen_w` thay đổi), toạ độ `btn_x` tự động dính sát mép phải màn hình (`screen_w - BTN_PANEL_W - 12`).

9. **Xoay màn hình TikTok-Style & Fullscreen Immersive**:
   * Khóa cố định chiều dọc toàn hệ thống (`orientation: portrait` trong `app.json`).
   * Sử dụng `expo-screen-orientation` với `OrientationLock.LANDSCAPE` cho phép xoay tự do 2 chiều (nghiêng trái/nghiêng phải).
   * Luôn bọc `.catch(() => {})` cho `lockAsync` ở `useEffect` cleanup để đảm bảo khôi phục chiều dọc an toàn khi unmount.
   * Truyền callback `on_orientation_change` để màn hình cha ẩn hoàn toàn `<CustomHeader>` khi ở chế độ ngang (`is_landscape === true`), nhường 100% diện tích chiều cao hiển thị báo cáo.

---

## Giải pháp khuyên dùng để ẩn Menu ba chấm và Phễu lọc (Không dùng Code)

Để ẩn hoàn toàn nút ba chấm `...` và ngăn bảng trượt bộ lọc bên phải (*Applied filters*) xuất hiện khi tương tác với biểu đồ, cách tốt nhất và duy nhất ổn định lâu dài là **cấu hình trực tiếp trong trang biên tập Looker Studio (Edit Mode) của báo cáo**:

### 1. Ẩn nút ba chấm `...` (Chart Header Menu):
1. Mở báo cáo bằng Google tài khoản quản trị và chuyển sang chế độ **Chỉnh sửa (Edit)**.
2. Click chọn biểu đồ cần cấu hình.
3. Ở thanh thuộc tính bên phải, chọn tab **Kiểu (Style)**.
4. Cuộn xuống phần **Đầu trang biểu đồ (Chart Header)**.
5. Đổi tùy chọn thành **Không hiển thị (Do not show)**.
   *(Nút ba chấm sẽ biến mất hoàn toàn trên mọi nền tảng, kể cả khi bấm vào biểu đồ).*

### 2. Ngăn bảng lọc bên phải (Applied filters) trượt ra:
1. Click chọn biểu đồ trong chế độ **Edit**.
2. Ở tab **Thiết lập (Setup)** bên phải, cuộn xuống dưới cùng.
3. Bỏ tích chọn mục **Tương tác (Interactions) -> Lọc chéo (Cross-filtering)**.
   *(Tính năng này khi tắt sẽ biến biểu đồ thành dạng tĩnh, bấm vào không kích hoạt lọc chéo nên bảng Applied filters bên phải sẽ không bao giờ xuất hiện).*

---

## Nhật ký các giải pháp thất bại (Lưu ý cho Agent sau)

Khi tìm cách ẩn nút menu ba chấm (`...` / More options) và phễu lọc hiển thị lúc click/tap vào biểu đồ Looker Studio:

1. **Thất bại 1: Inject CSS stylesheet ẩn class ở `<head>` của iframe chính**
   * *Mô tả*: Viết CSS ẩn `.ng2-chart-menu-button` hoặc `[aria-label*="chart menu"]` ở `<head>` của trang iframe cha.
   * *Kết quả*: Thất bại. Các nút menu và phễu này nằm sâu trong **Shadow DOM** nội bộ của từng chart component, do đó các quy tắc CSS toàn cục từ bên ngoài không thể xuyên qua để áp dụng.

2. **Thất bại 2: Quét DOM đệ quy và gán inline style (`display: none !important`) bằng JS**
   * *Mô tả*: Dùng JS quét định kỳ qua `shadowRoot` của từng chart rồi gán `style.setProperty('display', 'none')` vào các thẻ menu.
   * *Kết quả*: Thất bại. Trình duyệt iOS/Safari và cơ chế Change Detection của Angular/Looker Studio liên tục cập nhật và sinh lại nút mới (hoặc ghi đè thuộc tính inline style của phần tử) ngay khi người dùng chạm vào biểu đồ, làm nút xuất hiện trở lại.

3. **Thất bại 3: Chèn `<style>` trực tiếp vào bên trong từng `shadowRoot` của chart**
   * *Mô tả*: Cắm một thẻ style nội bộ chứa CSS ẩn vào mỗi Shadow DOM được tìm thấy để đè các quy tắc CSS của component.
   * *Kết quả*: Vẫn không ngăn chặn được hoàn toàn. Khi chạm vào biểu đồ, Looker Studio kích hoạt trình bắt sự kiện Tap Listener và chèn một overlay động từ bên ngoài (như `.cdk-overlay-container` hoặc cột Applied filters bên phải) trực tiếp vào thẻ `<body>` của tài liệu chính (vượt ngoài Shadow DOM của chart), cho nên các hộp thoại menu/bộ lọc vẫn bật lên bình thường.

4. **Thất bại 4: Bộ chặn click ở pha Capture (Capture-Phase Click Blocker) với các sự kiện click/mousedown/mouseup**
   * *Mô tả*: Dùng `addEventListener` ở pha bắt (`true`) cho `click`, `mousedown`, `mouseup` trên tài liệu iframe chính và gọi `e.stopPropagation()` để ngăn Angular nhận được tiêu điểm click của biểu đồ.
   * *Kết quả*: Thất bại trên iOS/Safari Mobile. WKWebView hiện đại sử dụng các sự kiện con trỏ và chạm (`pointerdown`, `pointerup`, `touchstart`, `touchend`) để kích hoạt lấy nét và mở các bảng menu động của Angular Material. Nếu chặn cả các sự kiện chạm này, người dùng sẽ bị khoá cứng không thể cuộn/vuốt màn hình trên các thẻ biểu đồ; còn nếu không chặn thì Looker vẫn phát hiện được thao tác chạm và hiện menu ba chấm/bộ lọc.
