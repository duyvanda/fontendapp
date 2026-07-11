# 🎨 Hướng dẫn & Tiêu chuẩn Thiết kế UI/UX (Merap Style)

Tài liệu này tổng hợp các quy chuẩn thiết kế thương hiệu Merap, tiêu chuẩn thiết kế kiểu chữ (Typography), khoảng cách (Spacing), các quy tắc trải nghiệm người dùng (UX) trên thiết bị di động, và các mẫu Prompt chuẩn để bạn sử dụng khi làm việc với AI coding assistant sau này.

---

## 0. Quy chuẩn Design (Merap Style)
- **Màu chủ đạo:** Xanh Teal (`#00A79D` và `#00766E`).
- **Nút bấm:** Bo tròn hoàn toàn (pill shape), dùng màu Gradient, có hiệu ứng đổ bóng xịn xò.
- **Khối thẻ (Cards):** Nền trắng, bo góc to (12px - 16px), đặt trên viền nền xám nhạt (`#f8fafc` hoặc `#f8f9fa`) để nổi bật.
- **Các tiểu tiết:** Đường kẻ đứt (dashed) chia khối, chữ in hoa kèm khoảng cách chữ (letter-spacing) cho tiêu đề.
- **Typography:** Sử dụng font sans-serif hiện đại (Inter/Roboto), phân cấp rõ ràng (heading, body, caption), ưu tiên dễ đọc trên mobile. 
- **Color system:** Ngoài màu chính, bổ sung màu trung tính (text, border) và màu ngữ nghĩa (success, warning, error) để dùng nhất quán. 
- **Spacing:** Áp dụng hệ 8px (8 / 16 / 24 / 32) để đảm bảo khoảng cách đồng đều giữa các thành phần. 
- **Component states:** Các nút và phần tử tương tác có đầy đủ trạng thái (hover, active, disabled). 
- **Shadow & Depth:** Định nghĩa mức đổ bóng rõ ràng cho card, hover và modal để tạo chiều sâu. 
- **Motion:** Sử dụng animation nhẹ (0.2–0.3s) cho hover và transition để tăng trải nghiệm. 
- **Responsive:** Thiết kế mobile-first, hiển thị tốt trên cả mobile, tablet và desktop.

---

## Ⅰ. Tiêu chuẩn Cỡ chữ (Typography Standards)

Kích thước chữ trên di động được thiết lập dựa trên các nguyên tắc của **Apple Human Interface Guidelines (HIG)** và **Google Material Design 3**.

### 1. Bảng phân cấp cỡ chữ tiêu chuẩn

| Thành phần giao diện | Cỡ chữ đề xuất | Độ đậm (Font Weight) | Phạm vi sử dụng |
| :--- | :--- | :--- | :--- |
| **H1 (Large Title)** | **`28px - 34px`** | Bold (`700`) | Tiêu đề logo, tiêu đề trang lớn nhất khi mở màn hình. |
| **H2 (Title)** | **`20px - 22px`** | Bold / Semi-bold | Tiêu đề trang con, tiêu đề chính của Card lớn. |
| **H3 (Sub-title)** | **`17px - 18px`** | Medium (`500`) | Tiêu đề phân khu, danh mục con bên trong trang. |
| **Body (Nội dung)** | **`15px - 16px`** | Regular (`400`) | Văn bản đọc chính (báo chí, mô tả, nội dung chatbot). |
| **Input Text** | **`16px`** | Regular (`400`) | Chữ người dùng gõ trực tiếp vào ô `TextInput`. |
| **Label / Button** | **`13px - 14px`** | Semi-bold (`600`) | Nhãn trường nhập liệu, text trên các nút nhấn. |
| **Caption / Metadata** | **`11px - 12px`** | Regular / Medium | Chú thích ảnh, ngày tháng, số phiên bản ở chân trang. |

### 2. Các quy tắc UX bắt buộc về kiểu chữ
*   **Quy tắc 16px chống Auto-zoom trên iOS:** Mọi trường nhập liệu `TextInput` phải có `fontSize` tối thiểu là **`16px`**. Nếu nhỏ hơn 16px, hệ điều hành iOS (iPhone) sẽ tự động phóng to giao diện khi người dùng chạm vào ô nhập, gây lệch bố cục trang web/app.
*   **Ngưỡng đọc tối thiểu (Minimum Size):** Không sử dụng cỡ chữ nhỏ hơn **`10px`**. Các chú thích siêu nhỏ cũng nên giữ tối thiểu là **`11px - 12px`** để tránh mỏi mắt.
*   **Chiều cao dòng (Line Height):** Luôn đặt `lineHeight` cho các khối chữ dài từ **`130% đến 150%`** kích thước chữ (ví dụ: chữ `16px` thì lineHeight tương ứng là `22px` - `24px`) để mắt dễ dàng lướt qua các dòng mà không bị nhảy hàng.

---

## Ⅱ. Tiêu chuẩn Khoảng cách (Spacing & Safe Area)

*   **Lề màn hình (Padding Horizontal):** Tiêu chuẩn từ **`16px`** (mật độ cao) đến **`24px`** (thông thoáng). Đối với màn hình đăng nhập hoặc danh sách, khoảng cách `24px` (`spacing.lg`) giúp giao diện trông sang trọng hơn và không bị đè sát viền trên các thiết bị hẹp.
*   **Khoảng cách giữa các ô nhập (Input Spacing):** Đặt margin dưới là **`16px`** (`spacing.md`) để phân tách rõ ràng.
*   **Khoảng cách nút chính (Action Button Spacing):** Khoảng cách từ ô nhập liệu cuối cùng đến nút Đăng nhập chính nên đặt tổng thể là **`24px`** (gợi ý: margin dưới của ô nhập 16px + margin trên của nút 8px) để vừa phân lớp nội dung vừa gắn kết logic hành động.
*   **Safe Area Bottom (Cạnh dưới màn hình):** Luôn dùng `insets.bottom` (từ `react-native-safe-area-context`) để cấu hình `paddingBottom` động cho chân trang. Đảm bảo các thông tin phụ hoặc nút bấm dưới cùng luôn cách mép dưới thiết bị tối thiểu **`Math.max(insets.bottom + 16, 24)`** để không bị che bởi thanh điều hướng Home Indicator của iPhone/Android tràn viền.
*   **Vùng chạm tối thiểu (Touch Target):** Mọi nút bấm hoặc liên kết chữ có thể nhấn được phải nằm trong một container chạm có kích thước tối thiểu **`44px x 44px`** (hoặc `48px x 48px`) để ngón tay dễ dàng bấm chính xác.


