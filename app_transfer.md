# Hướng dẫn & Điều kiện Transfer App BI PORTAL (App Store Connect)

### 1. Các điều kiện Transfer App theo quy định của Apple

| Điều kiện của Apple | Trạng thái / Yêu cầu đối với App hiện tại |
| :--- | :--- |
| **1. Đã có bản phát hành trên App Store** | App bắt buộc phải có ít nhất 1 phiên bản đã duyệt và phát hành chính thức trên App Store (*Ready for Sale*). Nếu app chỉ mới upload lên TestFlight hoặc đang ở dạng nháp (Draft) thì chưa thể transfer. |
| **2. Trạng thái App tại thời điểm transfer** | App không được nằm trong các trạng thái đang duyệt/chờ duyệt:<br>• *Waiting for Review*, *In Review*<br>• *Processing for Distribution*, *Accepted*<br>• *Pending Developer Release*, *Pending Apple Release* |
| **3. Trạng thái Đặt trước (Pre-order)** | App không được đang ở trạng thái cho phép người dùng đặt trước (Pre-order) ở bất kỳ quốc gia nào. |
| **4. Trạng thái 2 tài khoản Developer** | Cả tài khoản chuyển (Transferor) và tài khoản nhận (Recipient) phải hoạt động bình thường (không bị lock/pending) và đã đồng ý với các hợp đồng mới nhất (Paid/Free Agreements) của Apple. |
| **5. In-App Purchase (IAP)** | App hiện tại là **Free**, chưa tích hợp gói thanh toán IAP (tự động thỏa mãn). Nếu sau này có bổ sung IAP, các Product ID không được trùng với bất kỳ app nào thuộc tài khoản nhận. |
| **6. Loại ứng dụng** | App không phải Apple Arcade và không phải Mac App dùng Shared Container. ✅ (App hiện tại đáp ứng tốt). |

---

### 2. Về việc Transfer App BI PORTAL trên App Store Connect:
Theo quy định của Apple, chỉ người có vai trò **Account Holder** (Chủ tài khoản chính - thường là Giám đốc / Trưởng phòng IT đứng tên đăng ký Apple Developer của công ty) mới có quyền gửi và duyệt Transfer App.

**Cách phối hợp:**
1. **Xin thông tin từ công ty**: Anh xin sếp/IT của công ty 2 thông tin:
   - **Apple ID** (email tài khoản Apple Developer công ty).
   - **Team ID** của tài khoản công ty (nằm trong mục *Account > Membership Details*).
2. **Anh thao tác gửi**: Anh đăng nhập tài khoản cá nhân của anh vào App Store Connect -> chọn App -> chọn **Transfer App** -> nhập 2 thông tin của công ty ở trên.
3. **Nhờ công ty bấm Duyệt**: Anh báo người nắm tài khoản công ty (Account Holder) đăng nhập vào App Store Connect -> vào mục **Agreements, Tax, and Banking** để bấm **Accept Transfer**.

---

### 3. Giải pháp để anh tiếp tục quản lý/upload app sau khi đã Transfer:

Sau khi transfer xong, anh **không cần phải xin mật khẩu tài khoản chính** của công ty. Anh chỉ cần nhờ công ty cấp quyền cho anh như sau:

1. Nhờ **Account Holder của công ty** truy cập vào App Store Connect -> Mục **Users and Access**.
2. Thêm Email Apple ID của anh vào danh sách nhân sự công ty với vai trò:
   - **Admin** hoặc **App Manager** (Quản lý App).
3. **Kết quả**:
   - Anh sẽ dùng chính tài khoản/email của anh để đăng nhập vào xem/quản lý App Store Connect của công ty.
   - Khi chạy lệnh `eas build` hoặc `eas update`, anh chỉ cần đăng nhập tài khoản cá nhân của anh (vì tài khoản anh đã thuộc Team công ty trên Apple) để nộp bản build lên App Store bình thường!