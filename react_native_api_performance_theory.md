# Lý thuyết tối ưu hiệu năng API: Web vs React Native

Tài liệu này giải thích lý thuyết cốt lõi về lý do tại sao gọi API trên Web chỉ mất **0.1s**, trong khi trên ứng dụng React Native (cụ thể là iOS TestFlight) lại có thể mất tới **2s**.

Có hai nguyên nhân chính dẫn đến hiện tượng này:

## 1. Nút thắt cổ chai ở "React Native Bridge" và xử lý chuỗi (String/JSON)

Kiến trúc của React Native gồm 2 thế giới tách biệt: **Native** (Java/Kotlin trên Android, Objective-C/Swift trên iOS) và **JavaScript** (chứa code React của bạn). Chúng giao tiếp với nhau qua một "Cây cầu" gọi là **Bridge**.

> [!CAUTION]
> Truyền dữ liệu lớn qua Bridge và xử lý chuỗi phức tạp (như Regex) trên luồng JS đơn (Single-thread) là những tác vụ tốn cực kỳ nhiều tài nguyên, gây ra hiện tượng giật, lag hoặc "đứng hình" UI.

### So sánh cách hoạt động

| Môi trường | Cách thức xử lý | Ưu/Nhược điểm |
| :--- | :--- | :--- |
| **Web (Chrome/Safari)** | Engine V8 (C++) xử lý thẳng mạng, phân tích chuỗi (String), Regex (`.replace`) và `JSON.parse` với tốc độ ánh sáng. | **Ưu điểm:** Cực kỳ nhanh, do mọi thứ chạy trong cùng một môi trường native của trình duyệt. |
| **React Native (Code cũ)** | 1. Tầng Native tải dữ liệu văn bản về.<br>2. Cục văn bản lớn được nén và đẩy qua **Bridge** sang tầng JS.<br>3. Tầng JS chạy Regex `.replace` trên toàn bộ văn bản lớn.<br>4. Tầng JS chạy `JSON.parse`. | **Nhược điểm:** Tốn thời gian đẩy cục text khổng lồ qua Bridge. Chạy Regex và Parse trên cục dữ liệu lớn làm block luồng JS, khiến app bị khựng lại. |

### Giải pháp tối ưu
Thay vì nhận toàn bộ dữ liệu dưới dạng Text rồi mới xử lý:
1. Gọi thẳng `response.json()` để tầng Native tự parse thẳng thành cấu trúc Object (nhanh hơn rất nhiều).
2. Khi lặp qua các object (vòng lặp `map`), chỉ áp dụng Regex `.replace()` cho duy nhất một thuộc tính cần thiết (vd: `link_report`).

---

## 2. Thuật toán DNS "Happy Eyeballs" vs Apple IPv6 Policy

Nguyên nhân thứ hai thường xuyên xảy ra trên các ứng dụng cài qua **TestFlight** (iOS thật) và gây ra độ trễ đều đặn từ 1.5 đến 2 giây cho mọi request mạng đầu tiên.

> [!NOTE]
> Apple yêu cầu bắt buộc các ứng dụng trên App Store phải hỗ trợ giao thức mạng IPv6. Điều này định hình cách iOS phân giải tên miền.

### So sánh cách thức kết nối

| Môi trường | Thuật toán phân giải mạng | Kết quả |
| :--- | :--- | :--- |
| **Web (Trình duyệt)** | Áp dụng thuật toán **"Happy Eyeballs" (RFC 8305)**: Trình duyệt gửi request tới cả địa chỉ IPv4 và IPv6 cùng một lúc. Đường nào phản hồi nhanh hơn thì dùng đường đó. | Rất mượt mà và tốc độ cực cao, không có thời gian chết. |
| **iOS App (Native)** | Sử dụng `NSURLSession` của iOS. iOS sẽ **ưu tiên IPv6** và cố gắng kết nối trước. Nếu server (hoặc firewall) cấu hình IPv6 không phản hồi rõ ràng (bị drop request), iOS sẽ ngâm request ở đó và **chờ Timeout khoảng 1.5 - 2 giây**. Sau 2 giây vô vọng, nó mới fallback xuống dùng **IPv4**. | Gây ra một độ trễ tĩnh luôn luôn ở mức 1.5 - 2 giây cho API, dù mạng có nhanh đến đâu. |

### Cách kiểm tra (Debug)
Để biết chắc chắn mình đang bị chậm ở Khâu xử lý JSON (Nguyên nhân 1) hay Khâu phân giải mạng IPv6 (Nguyên nhân 2), hãy in ra log thời gian giữa các bước:

```javascript
const start = Date.now();

// 1. Khâu mạng (Network)
const response = await fetch(URL);
const networkTime = Date.now() - start;

// 2. Khâu Parse JSON
const data = await response.json();
const parseTime = Date.now() - start - networkTime;

Alert.alert("Debug API", `Mạng: ${networkTime}ms \nParse: ${parseTime}ms`);
```

- Nếu `networkTime` cao (>1500ms): Chắc chắn 100% do vấn đề DNS / IPv6 của backend.
- Nếu `parseTime` cao: Bạn cần tiếp tục tối ưu hóa khâu xử lý mảng/chuỗi dữ liệu lớn trong code Javascript.
