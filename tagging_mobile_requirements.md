# HƯỚNG DẪN NGHIỆP VỤ & PHÁT TRIỂN TÍNH NĂNG GẮN TAGS CHO MOBILE APP (REACT NATIVE)

Tài liệu này chi tiết hóa cách thức hoạt động, API đồng bộ và quy chuẩn UI/UX của tính năng quản lý báo cáo theo **Tags** từ phiên bản Web để áp dụng đồng bộ sang ứng dụng di động **React Native**.

> **LƯU Ý QUAN TRỌNG**: Trên Mobile sẽ dùng thống nhất thuật ngữ **Tags** (hoặc **Nhóm Tags**) và **Thư mục Tag**, tuyệt đối không sử dụng từ **Workspace** trên giao diện ứng dụng di động.

---

## 1. Tổng Quan Tính Năng (Feature Overview)
* **Ý tưởng cốt lõi**: Cho phép người dùng cá nhân hóa danh sách báo cáo bằng cách gán các nhãn phân loại (**Tags**). Mỗi tag sẽ hoạt động như một **Thư mục Tag (Tag Folder)** để gom nhóm các báo cáo liên quan.
* **Đồng bộ đa nền tảng**: Toàn bộ Tags được lưu trữ trên Cơ sở dữ liệu tập trung theo mã nhân viên (`manv`) và ID báo cáo (`report_id`/`stt`). Người dùng cấu hình tags trên Web sẽ tự động thấy trên Mobile và ngược lại.

---

## 2. Thiết Kế Cơ Sở Dữ Liệu & API (APIs & Data Model)

### A. Định dạng dữ liệu Tag đính kèm báo cáo từ Server
Khi tải danh sách báo cáo của user từ API chính, mỗi item báo cáo sẽ có thêm trường `tags` dưới dạng chuỗi JSON stringified hoặc mảng Array:
```json
{
  "stt": "1001",
  "tenreport": "CRM | Sales Performance",
  "link_report": "https://...",
  "tags": "[\"SALES\",\"SẾP\"]", // Chuỗi JSON cần parse
  "yeu_thich": "1"
}
```
> **Lưu ý**: Trên Client di động, khi nhận danh sách báo cáo, cần duyệt qua và parse trường `tags` sang mảng: `tags = item.tags ? JSON.parse(item.tags) : []`.

### B. API Ghi nhận/Cập nhật Tags (Save Tags)
Khi người dùng thêm mới hoặc xóa một tag của báo cáo nào đó, gọi API sau để lưu trạng thái:

* **Endpoint**: `POST https://bi.meraplion.com/local/post_data/insert_report_user_prefs_tags/`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
[
  {
    "manv": "M0123",            // Mã nhân viên đăng nhập
    "report_id": "1001",        // ID báo cáo (trường 'stt')
    "tags": ["SALES", "SẾP"]    // Danh sách mảng tags mới (đã viết HOA)
  }
]
```

---

## 3. Thiết Kế UI/UX Trên Mobile (React Native Layout)

### A. Màn hình tất cả báo cáo (All Reports / Home)
1. **Pill-shaped Badges**: Trên mỗi dòng item báo cáo, nếu có tags đi kèm, hiển thị các tag nhỏ gọn nằm sát cạnh phải của tên báo cáo.
2. **Quy chuẩn Styling (Merap Style)**:
   * **Nền tag**: Màu xanh lá nhạt pha mờ (`rgba(0, 167, 157, 0.08)`).
   * **Màu chữ**: Xanh Teal đậm (`#00766E`) để tăng độ tương phản và dễ đọc.
   * **Bo góc**: Bo tròn dạng Pill (`borderRadius: 50` hoặc `borderRadius: 12`).
   * **Font chữ**: Cỡ chữ nhỏ (`fontSize: 10` hoặc `11`), viết HOA toàn bộ, có khoảng cách giãn chữ (`letterSpacing: 0.5`).
3. **Nút Quản lý tags (⋯)**: Hiển thị icon dấu ba chấm đứng/ngang hoặc icon nhãn tag ở cuối dòng để bấm mở Modal quản lý tags.

---

### B. Modal Quản Lý Tags (Tag Management Modal)
* **Giao diện hiện tại**: Hiển thị danh sách các tag đã gán dưới dạng các nút đỏ nhạt (`rgba(220, 53, 69, 0.06)`), viền mỏng kèm chữ đỏ (`#dc3545`) và icon `x` bên cạnh. Người dùng click vào tag nào sẽ xóa ngay tag đó.
* **Giao diện thêm mới**: 
  * Gồm 1 trường Input nhập text và 1 nút `+ Thêm`.
  * **Xử lý Input**: Tự động viết HOA chữ cái khi nhập (`autoCapitalize="characters"`) và cắt khoảng trắng thừa ở 2 đầu.
* **Đồng bộ hóa**: Bấm đóng Modal hoặc bấm nút lưu sẽ gọi API `insert_report_user_prefs_tags` để lưu lại.

---

### C. Màn hình Nhóm Tags (Danh Sách Thư Mục Theo Tag)
Màn hình này hiển thị danh sách các thư mục tag. Mỗi thư mục đại diện cho một tag độc nhất.

#### 1. Cấu trúc tiêu đề thư mục tag (Folder Header):
Thiết kế theo dạng Flexbox hàng ngang (`flexDirection: 'row'`, `alignItems: 'center'`):
* **Bên trái**: Icon thư mục đóng `📁` hoặc mở `📂` (cỡ `18dp`), đi kèm khoảng cách (`marginRight: 8dp`).
* **Kế tiếp (Căn lề tự nhiên)**: Tên tag dạng chữ in đậm (ví dụ: `SALES`) và **Badge đếm số lượng báo cáo** nằm ngay kế bên (cách khoảng 8dp).
  * **Badge số lượng**: Màu xám nhạt (`#f1f5f9`), viền mỏng (`#e2e8f0`), chữ xám đậm (`#475569`), bo góc vuông nhẹ (`borderRadius: 6`).
  * **Giải pháp bố cục**: Đóng gói Tên thư mục tag và Badge số lượng vào chung một view có `flex: 1` hoặc `flexGrow: 1` để đẩy mũi tên bên phải ra biên ngoài cùng.
* **Bên phải kịch biên**: Mũi tên chỉ hướng `▲` (khi mở) hoặc `▼` (khi đóng).

```
+-------------------------------------------------------------+
|  📂  SALES  [ 2 ]                                       ▲  |
|      +---------------------------------------------------+  |
|      |  ★  [📊] CRM | Sales Performance            SALES |  |
|      |  ☆  [📊] Monthly Sales Analysis             SALES |  |
|      +---------------------------------------------------+  |
|  📁  HR  [ 1 ]                                          ▼  |
+-------------------------------------------------------------+
```

#### 2. Trạng thái Đóng/Mở thư mục tag:
* **Mặc định khi vào màn hình**: Tất cả thư mục tag đều được **Mở sẵn**.
* **Cách quản lý trạng thái**: Sử dụng một React State kiểu `Set` lưu tên các tag đang mở:
  ```javascript
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  ```
* **Khi click vào thư mục tag**: Tự động chuyển đổi trạng thái đóng/mở bằng cách thêm hoặc xóa tag khỏi `Set`. Trạng thái này lưu cục bộ (local state), **không đẩy lên URL hay Server**.
* **Nút Mở tất cả (Expand All) / Thu tất cả (Collapse All)**:
  * Nút `Mở tất cả`: Cập nhật `expandedFolders` chứa toàn bộ danh sách tags.
  * Nút `Thu tất cả`: Reset `expandedFolders` về một `Set` rỗng.

---

### D. Thanh Công Cụ (Toolbar) & Bộ Lọc Danh Sách Tags
Thiết kế một Toolbar chuyên nghiệp dạng hộp bo tròn, nền trắng, đổ bóng nhẹ đặt dưới thanh tìm kiếm:
1. **Tìm kiếm thư mục tag & báo cáo**: 
   * Input tìm kiếm lọc theo tên tag hoặc tên báo cáo bên trong tag.
2. **Bộ lọc sắp xếp (Sorting Buttons)**:
   * **A→Z**: Sắp xếp danh sách tên các tag theo thứ tự bảng chữ cái tăng dần.
   * **Z→A**: Sắp xếp tên tag giảm dần.
   * **Số lượng (Count)**: Sắp xếp các tag có nhiều báo cáo nhất nằm lên đầu.

---

## 4. Các Lưu Ý Kỹ Thuật (React Native Implementation Tips)

1. **Hiệu năng Render**: Do danh sách báo cáo có thể dài, hãy sử dụng `FlatList` cho danh sách thư mục tag. Phần danh sách báo cáo con bên trong mỗi tag có thể dùng `.map()` thông thường vì số lượng báo cáo con mỗi tag thường không quá lớn (< 20 items).
2. **Trải nghiệm chạm (Touchable)**: Sử dụng `TouchableOpacity` or `Pressable` kèm theo hiệu ứng phản hồi xúc giác nhẹ (Haptic Feedback) khi đóng/mở thư mục tag hoặc quản lý tag để tạo cảm giác mượt mà, cao cấp.
3. **Hiệu ứng chuyển cảnh**: Nên tích hợp animation mở rộng/thu hẹp chiều cao (dùng `LayoutAnimation` của React Native hoặc thư viện `react-native-reanimated`) để danh mục tag trượt ra trượt vào mượt mà thay vì xuất hiện đột ngột.
