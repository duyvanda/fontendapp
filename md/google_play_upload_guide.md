# 🚀 Hướng Dẫn Build & Upload Ứng Dụng Lên Google Play Console

Sau khi bạn đã được mời làm App Admin của Google Play Console, quy trình đưa app (ứng dụng) React Native (Expo) lên cửa hàng bao gồm 3 giai đoạn chính: **Build file .aab**, **Cấu hình thông tin App trên Store**, và **Tạo Release mới**.

Dưới đây là các bước chi tiết.

---

## GIAI ĐOẠN 1: Build File Android App Bundle (.aab)

Google Play hiện tại **bắt buộc** định dạng `.aab` (Android App Bundle) thay vì `.apk` cho các bản phát hành chính thức. Cấu hình `eas.json` của bạn ở profile `production` đã được thiết lập mặc định để tạo ra định dạng này.

1. **Chạy kiểm tra lỗi (luôn cần thiết):**
   Mở terminal trong thư mục `fontendapp` và chạy:
   ```bash
   npx tsc --noEmit
   ```

2. **Chạy lệnh build Production cho Android:**
   ```bash
   eas build --platform android --profile production
   ```
   > 💡 **Lưu ý:** Lệnh này sử dụng cấu hình `"channel": "production"` và `"autoIncrement": true` trong `eas.json` giúp tự động tăng version code (versionCode) sau mỗi lần build thành công.

3. **Tải file .aab:**
   Sau khi EAS hoàn thành quá trình build trên server, Terminal sẽ cung cấp một đường link để tải file. Hãy nhấp vào link đó để tải tệp `.aab` về máy tính của bạn.

---

## GIAI ĐOẠN 2: Thiết lập thông tin ứng dụng trên Google Play Console

Nếu Admin công ty (chủ tài khoản chính) đã tạo sẵn ứng dụng (tạo "vỏ" app) và cấp quyền App Admin cho bạn, bạn bỏ qua bước tạo app và đi thẳng vào thiết lập:

1. Truy cập **[Google Play Console](https://play.google.com/console)** và đăng nhập với tài khoản Google đã được cấp quyền (VD: `vanquangduy@gmail.com`).
2. Tại màn hình **Tất cả ứng dụng (All apps)**, click chọn vào ứng dụng **BI Portal** đã được tạo sẵn.
3. Tại bảng điều khiển của ứng dụng (Dashboard), hãy hoàn thành danh sách công việc trong phần **Thiết lập ứng dụng của bạn (Set up your app)** *(nếu Admin chưa điền)*. Đây là những mục bắt buộc của Google trước khi phát hành:
   - **Privacy policy:** Cung cấp URL chính sách bảo mật của công ty.
   - **App access:** Cung cấp tài khoản test nếu app yêu cầu đăng nhập.
   - **Ads:** Khai báo app có chứa quảng cáo hay không.
   - **Content rating:** Trả lời bảng câu hỏi để xếp hạng nội dung (độ tuổi).
   - **Target audience and content:** Chọn độ tuổi người dùng mục tiêu.
   - **News apps:** Xác nhận app có phải là ứng dụng tin tức không.
   - **COVID-19 contact tracing:** Khai báo về các tính năng liên quan đến COVID-19.
   - **Data safety (Bảo mật dữ liệu):** Khai báo các dữ liệu mà ứng dụng thu thập. *(Rất quan trọng! Do app có quyền Camera, Media, Audio,... nên cần khai báo rõ mục đích).*
   - **Store listing (Thông tin trên cửa hàng):**
     - Mô tả ngắn, Mô tả chi tiết.
     - Icon ứng dụng (512x512).
     - Đồ họa nổi bật (Feature graphic: 1024x500).
     - Ảnh chụp màn hình (Điện thoại, Máy tính bảng).

---

## GIAI ĐOẠN 3: Tải file .aab lên & Phát hành

Sau khi thiết lập xong thông tin, bạn có thể tải bản build của mình lên. Bạn có thể chọn phát hành cho Nhóm thử nghiệm nội bộ (Internal Testing) trước, hoặc đẩy thẳng lên Sản xuất (Production).

Dưới đây là các bước đẩy thẳng lên Production (Sản xuất):

1. Trong thanh menu bên trái, cuộn xuống phần **Release (Phát hành)** -> chọn **Production (Sản xuất)**.
2. Nhấn nút **Create new release (Tạo bản phát hành mới)**.
3. **App Signing by Google Play:** Google sẽ yêu cầu quản lý khóa ký (App signing key) của bạn. Nếu bạn dùng Expo, Expo đã tự động lo phần keystore, bạn chỉ cần chọn **Sử dụng Khóa do Google Play quản lý (Use Google Play App Signing)**.
4. **App bundles and APKs:** Kéo thả hoặc tải lên file `.aab` mà bạn đã tải về máy ở Giai đoạn 1. Đợi Google xử lý file này.
5. **Release name (Tên bản phát hành):** Google sẽ tự lấy từ version trong `app.json` (VD: 1.0.1).
6. **Release notes (Ghi chú phát hành):** Ghi rõ những tính năng mới trong bản cập nhật này (VD: "- Tích hợp FCM thông báo đẩy, - Bổ sung các báo cáo mới").
7. Nhấn **Lưu (Save)**.
8. Nhấn **Xem lại bản phát hành (Review release)**.
9. Nếu không có lỗi (Errors - Cảnh báo Warnings thì có thể bỏ qua), nhấn **Start rollout to Production (Bắt đầu triển khai lên bản Sản xuất)**.

---

## ⏳ Chờ Kiểm duyệt (Review)

- Ứng dụng sẽ chuyển sang trạng thái **Đang xem xét (In review)**.
- Đối với tài khoản mới hoặc ứng dụng mới, Google có thể mất từ **1 đến 7 ngày làm việc** để kiểm duyệt. Các bản cập nhật sau sẽ nhanh hơn (thường dưới 24h).
- Khi được duyệt, ứng dụng sẽ có mặt trên Google Play Store để mọi người tải về.

> **Mẹo nâng cao: Submit tự động bằng lệnh EAS**
> Khi mọi thứ trên Google Play Console đã cấu hình xong cho lần đầu, ở các lần cập nhật tiếp theo, bạn có thể cấu hình Auto-Submit để lệnh `eas build` tự đẩy thẳng file `.aab` lên Store bằng lệnh: 
> `eas build --platform android --profile production --auto-submit`
> *(Yêu cầu thiết lập Google Service Account JSON cho Play Console API).*
