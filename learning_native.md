Viewed STEPS.md:1-800

Dưới đây là các kiến thức cốt lõi của **React Native** được thiết kế chi tiết dành riêng cho bạn – người đã có nền tảng **React JS**. 

Từ góc nhìn của một React developer, quá trình chuyển đổi sang React Native sẽ rất thuận lợi vì cơ chế quản lý state, props, lifecycle và Hooks (`useState`, `useEffect`, `useMemo`,...) hoàn toàn giống nhau. Tuy nhiên, cách render giao diện, xử lý sự kiện và tối ưu hiệu năng sẽ có những điểm khác biệt cốt lõi sau:

---

### 1. Thay thế Thẻ HTML bằng Native Components (Mành cấu trúc)
Trong React JS, bạn dùng các thẻ HTML (`div`, `span`, `p`, `img`, `button`). Trong React Native, bạn bắt buộc phải dùng các Component được cung cấp sẵn bởi React Native để ánh xạ (map) sang UI gốc của iOS/Android.

*   **`View` thay thế cho `div`:** Dùng làm container để bao bọc và bố cục giao diện.
*   **`Text` thay thế cho `p`, `span`, `h1`-`h6`:** Mọi chuỗi văn bản trong React Native **bắt buộc** phải nằm trong thẻ `<Text>`. Bạn không thể viết chữ khơi khơi trong thẻ `<View>` như viết trong `<div>`.
*   **`Image` thay thế cho `img`:** Dùng hiển thị ảnh. Truyền ảnh local qua `require('./path')` hoặc ảnh mạng qua `source={{ uri: 'https://...' }}`.
*   **`TextInput` thay thế cho `input type="text"`:** Dùng nhập liệu.
*   **Không có thẻ `<a>`:** Sử dụng thư viện navigation (ví dụ: `expo-router` hoặc `@react-navigation/native`) để chuyển trang.

*So sánh nhanh:*
```jsx
// React JS
const WebCard = () => (
  <div>
    <h1>Hello World</h1>
    <p>This is React JS</p>
  </div>
);

// React Native
import { View, Text } from 'react-native';

const MobileCard = () => (
  <View>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hello World</Text>
    <Text>This is React Native</Text>
  </View>
);
```

---

### 2. Sự khác biệt về Styling (CSS-in-JS)
React Native không hỗ trợ file `.css` hay các selector class thông thường. Tất cả style đều được viết bằng JavaScript thông qua API `StyleSheet.create`.

*   **Không có đơn vị đo (`px`, `em`, `rem`, `%`):** Tất cả các con số định lượng kích thước (như `width`, `height`, `margin`, `padding`) đều là số thuần túy (unitless). Chúng đại diện cho mật độ điểm ảnh độc lập (Density-independent Pixels - dp).
*   **Flexbox là mặc định:** Mọi thẻ `View` mặc định đều có `display: flex` và hướng dòng chảy `flexDirection` mặc định là **`column`** (chiều dọc), ngược lại với Web mặc định là `row` (chiều ngang).
*   **Không hỗ trợ kế thừa style:** Trên Web, nếu bạn set màu chữ ở thẻ cha `div`, các thẻ con `p` bên trong sẽ kế thừa màu đó. Trong React Native, bạn phải định nghĩa style màu chữ trực tiếp trên từng thẻ `Text`.
*   **Không hỗ trợ toàn bộ thuộc tính CSS:** Một số thuộc tính như `hover` (vì mobile dùng cảm ứng chạm chứ không có con trỏ chuột) hoặc các thuộc tính hiệu ứng phức tạp của CSS sẽ không hoạt động.

*Ví dụ dùng `StyleSheet`:*
```jsx
import { StyleSheet, View, Text } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Học React Native</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // chiếm toàn bộ màn hình khả dụng
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#333',
  },
});
```

---

### 3. Cơ chế Cuộn Trang (Scrolling)
Trên trình duyệt Web, nếu nội dung dài hơn chiều cao màn hình, trình duyệt sẽ tự động sinh thanh cuộn. Nhưng đối với mobile:
*   Mặc định thẻ `<View>` **không thể cuộn**. Nếu nội dung tràn màn hình, phần thừa sẽ bị ẩn đi.
*   **`ScrollView`**: Thích hợp cho các form đăng ký hoặc trang chứa lượng nội dung tĩnh vừa phải. Nó sẽ render toàn bộ các component con ngay lập tức.
*   **`FlatList` hoặc `SectionList`**: Dành cho danh sách dài/vô tận (ví dụ: newfeed, danh sách sản phẩm). Cơ chế này cực kỳ quan trọng vì nó chỉ render các item đang hiển thị trên màn hình (lazy loading) và hủy/tái sử dụng các item đã cuộn đi để tối ưu bộ nhớ RAM cho thiết bị di động.

*Ví dụ sử dụng `FlatList`:*
```jsx
import { FlatList, Text, View } from 'react-native';

const data = [{ id: '1', name: 'Meal 1' }, { id: '2', name: 'Meal 2' }];

export default function MyList() {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 20 }}>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
```

---

### 4. Tương tác Người dùng (Events)
Thay vì các sự kiện chuột như `onClick` hay `onMouseOver`, Mobile sử dụng các hành vi chạm (Gestures) và phản hồi xúc giác.

*   **Không có `onClick`:** Thay vào đó ta dùng thuộc tính **`onPress`**.
*   **Các component phản hồi chạm (Touchables & Pressable):** 
    *   Các thẻ mặc định như `View`, `Text` không nhận sự kiện `onPress` một cách tối ưu. Bạn phải bọc chúng bằng các component tương tác như:
        *   `TouchableOpacity`: Khi chạm vào, component sẽ mờ đi một chút để báo hiệu cho người dùng.
        *   `TouchableHighlight`: Sẽ đổi màu nền khi chạm.
        *   `Pressable`: Component thế hệ mới, cho phép tùy biến sâu hơn dựa trên trạng thái (như đang nhấn, vừa thả ra...).
*   **Sự kiện nhập liệu:** Thay vì `onChange={(e) => setValue(e.target.value)}`, `TextInput` của React Native trả về trực tiếp giá trị text thông qua **`onChangeText={(text) => setValue(text)}`**.

---

### 5. Điều hướng màn hình (Navigation)
Khác với Web chuyển hướng bằng URL, ứng dụng Mobile quản lý các màn hình theo cơ chế **ngăn xếp (Stack)** (màn hình mới đè lên màn hình cũ, nhấn nút Back sẽ lấy màn hình trên cùng ra khỏi stack).

Hiện tại có hai thư viện điều hướng phổ biến nhất:
*   **React Navigation:** Thư viện tiêu chuẩn, khai báo router bằng code JS/TS.
*   **Expo Router (Được khuyên dùng):** Thư viện mới đi kèm với Expo SDK, hoạt động tương tự như Next.js. Bạn chỉ cần tạo thư mục và file trong `app/` (ví dụ: `app/index.tsx`, `app/meals.tsx`), hệ thống sẽ tự động cấu hình router.

---

### 6. Xử lý đa nền tảng (Cross-platform) & API Thiết bị
React Native cho phép bạn viết 1 codebase chạy trên cả iOS và Android, nhưng đôi khi bạn cần UI/Logic khác nhau cho mỗi hệ điều hành.

*   **Đối tượng `Platform`:** Bạn có thể kiểm tra thiết bị đang chạy là hệ điều hành gì hoặc viết style riêng biệt.
    ```javascript
    import { Platform, StyleSheet } from 'react-native';

    const styles = StyleSheet.create({
      header: {
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
      },
    });
    ```
*   **SafeAreaView:** Trên iOS (đặc biệt các dòng iPhone có tai thỏ/dynamic island), nếu bạn render sát mép trên, nội dung sẽ bị đè bởi thanh trạng thái (status bar). Thẻ `<SafeAreaView>` giúp tự động căn lề thụt lùi để bảo vệ nội dung không bị che khuất.
*   **Truy cập phần cứng:** Muốn dùng Camera, Định vị (Location), Bộ nhớ trong (AsyncStorage), Cảm biến... bạn không thể dùng Web API thông thường mà phải cài đặt các thư viện cầu nối (Bridge) như `expo-camera`, `expo-location`...

---

### 7. Luồng xử lý (The Bridge & New Architecture)
Dưới nắp ca-pô, React Native hoạt động bằng cách chạy code Javascript của bạn trên một engine JS riêng biệt (Hermes), sau đó giao tiếp với luồng UI Gốc (Native UI Thread) của điện thoại.
*   **Cơ chế Bridge:** Mọi tương tác của bạn được tuần tự hóa (serialize) thành dữ liệu JSON gửi qua một "cây cầu" (Bridge) để gửi tới Native side.
*   **Tối ưu hiệu năng:** Vì giao tiếp qua Bridge có thể bị nghẽn (ví dụ khi scroll list quá nhanh hoặc làm animation nặng), bạn nên hạn chế tối đa việc cập nhật state liên tục (như sự kiện di chuyển ngón tay) hoặc dùng các thư viện animation chạy trực tiếp ở luồng Native như `react-native-reanimated`.

---

### 8. Công cụ phát triển (Expo vs Bare React Native)
Khi bắt đầu dự án, bạn sẽ đứng trước 2 lựa chọn:
*   **Expo (Khuyên dùng cho người mới):** Là một bộ công cụ mạnh mẽ bao quanh React Native giúp tối giản hóa việc cài đặt. Bạn không cần cài Xcode hay Android Studio trên máy để bắt đầu code, chỉ cần quét mã QR bằng ứng dụng Expo Go trên điện thoại thật là chạy được.
*   **React Native CLI (Bare Workflow):** Bạn tự quản lý các thư mục code native Java/Kotlin (Android) và Objective-C/Swift (iOS). Lựa chọn này phức tạp hơn nhiều và chỉ cần thiết khi dự án cần can thiệp sâu vào code native hoặc tích hợp thư viện đặc thù không hỗ trợ Expo.

**Lời khuyên:** Bạn nên bắt đầu ngay với **Expo** để tránh mất hàng giờ cấu hình môi trường giả lập.

---

### 9. File-based Routing trong Expo Router
Khác với Web truyền thống phải dùng `App.js` hay component `<Route>` để đăng ký định tuyến thủ công, dự án này sử dụng Expo Router để tự động cấu trúc route dựa trên thư mục:
* **Tự động mapping:** Mỗi file `.tsx` trong `src/app/` là một màn hình (ví dụ: [account.tsx](file:///d:/django_apps/rest/fontendapp/src/app/account.tsx) là `/account`, [login.tsx](file:///d:/django_apps/rest/fontendapp/src/app/login.tsx) là `/login`).
* **Group Routes (Thư mục đóng ngoặc đơn):** Thư mục dạng `(tabs)` dùng để nhóm các màn hình có chung layout (như thanh Tab Bar ở dưới) mà không làm thay đổi URL/đường dẫn của trang.
* **Layout file (`_layout.tsx`):** Được dùng để cấu hình giao diện chung, hiệu ứng chuyển trang (Stack, Tabs), ẩn/hiện Header hệ thống thay vì làm nhiệm vụ đăng ký router.

---

### 10. Quản lý trạng thái toàn cục (React Context) & Đồng bộ UI
Để giải quyết bài toán chia sẻ trạng thái như số lượng thông báo chưa đọc (`unread_count`) trên thanh Tab Bar dùng chung:
* **Context API:** Gom dữ liệu thông báo vào một Context chung (`NotificationContext`).
* **Tại sao gọi Hook ở Layout?** Hook `useNotification` được gọi ở file Layout [_layout.tsx](file:///d:/django_apps/rest/fontendapp/src/app/(tabs)/_layout.tsx) để vẽ huy hiệu đỏ (Badge) thông báo trên thanh điều hướng chung. Nhờ vậy, chấm thông báo có thể tự cập nhật kể cả khi người dùng đang ở tab Home hay các tab khác.
* **Không làm giảm hiệu năng mạng:** Việc gọi `useNotification` chỉ lấy giá trị từ React State có sẵn trong bộ nhớ tạm (RAM) của thiết bị chứ **không** gọi API liên tục mỗi lần render. Việc gọi API mạng chỉ diễn ra định kỳ (ví dụ mỗi 60 giây) hoặc khi có thao tác cụ thể từ người dùng.

---

### 11. Tách Component Phụ vs Hàm Render trong React Native
Khi xây dựng giao diện danh sách dài bằng `FlatList`, ta cần lưu ý cách xử lý các component phụ:
* **Tại sao nên viết dạng Hàm Render Helper (ví dụ: `const render_item = () => JSX`):** 
  - Khớp với cấu trúc tham số đầu vào `renderItem` của `FlatList`.
  - Dễ dàng truy cập trực tiếp vào State/Hàm của component cha qua closure mà không cần truyền props phức tạp.
  - **Tránh lỗi re-render nghiêm trọng:** Nếu khai báo component con lồng bên trong component cha (như `const Item = () => JSX` trong `HomeScreen`), mỗi lần cha re-render, React sẽ tạo lại định nghĩa của component con từ đầu. Điều này khiến toàn bộ danh sách bị hủy (unmount) và dựng lại (mount) liên tục, gây giật lag và nhấp nháy màn hình.
* **Khi nào dùng `const Component` thực sự?** Khi component con đủ phức tạp, cần quản lý state riêng hoặc cần tái sử dụng ở nhiều file khác nhau. Lúc đó, bắt buộc phải tách nó ra một file độc lập trong thư mục `src/components/`.