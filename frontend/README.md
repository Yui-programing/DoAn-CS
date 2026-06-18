# TuneVault - Giao diện người dùng (React Frontend)

Thư mục này chứa toàn bộ mã nguồn giao diện người dùng của ứng dụng **TuneVault** (Spotify Clone), được xây dựng bằng các công nghệ hiện đại nhằm tối ưu trải nghiệm nghe nhạc và xem MV trực tuyến.

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **React 19 & TypeScript**: Framework mạnh mẽ giúp xây dựng UI động, kiểu an toàn và tối ưu hóa render.
* **Vite**: Bộ công cụ xây dựng (build tool) thế hệ mới siêu nhanh.
* **Tailwind CSS v4 & Vanilla CSS**: Cung cấp giao diện tối giản, linh hoạt, responsive tốt và hỗ trợ dark mode/glassmorphism cực kỳ đẹp mắt.
* **React Router v7**: Điều hướng trang mượt mà không cần tải lại trang.
* **SignalR Client (.NET)**: Nhận thông báo thời gian thực từ server.
* **Lucide Icons**: Bộ icon hiện đại, đồng bộ phong cách tối giản.

## 📁 Cấu trúc thư mục chính

Cấu trúc thư mục được thiết kế rõ ràng theo mô hình module:

* `src/assets/`: Chứa các tài nguyên tĩnh như hình ảnh, SVG logo, fonts...
* `src/components/`: Các component dùng chung cho toàn bộ dự án (Button, Modal, Table danh sách bài hát...).
* `src/contexts/`: Quản lý trạng thái toàn cục (Global State) qua React Context:
  * `AuthContext`: Quản lý đăng nhập, đăng ký, thông tin người dùng.
  * `PlayerContext`: Quản lý trình phát nhạc toàn cục (bài hát hiện tại, hàng đợi phát, chế độ shuffle/repeat, âm lượng, tiến trình phát).
  * `FavoriteContext`: Trạng thái yêu thích/thả tim các bài hát.
  * `NotificationContext`: Lắng nghe và hiển thị thông báo thời gian thực qua SignalR.
* `src/layouts/`: Các khung giao diện dùng chung.
  * `MainLayout`: Giao diện chính chứa Sidebar, Header và thanh điều khiển nhạc bên dưới.
* `src/pages/`: Các trang nghiệp vụ chính (Home, Search, Library, VideoPlayer, Login, Register, Profile, Admin...).
* `src/services/`: Quản lý các cuộc gọi API qua Axios client được cấu hình sẵn.
* `src/routes/`: Cấu hình định tuyến Route của dự án.

> [!NOTE]
> Bạn có thể đọc chi tiết giải thích cấu trúc từng thư mục con tại file [GiaiThich.md](file:///d:/VSCode/Spotify/DoAn-CS/frontend/src/GiaiThich.md).

## 🚀 Thiết lập & Khởi chạy ở Local (Không qua Docker)

Nếu bạn muốn chỉnh sửa code frontend nhanh chóng với cơ chế Hot Reload nhanh nhất mà không cần chạy qua Docker container, hãy thực hiện theo các bước sau:

**1. Di chuyển vào thư mục frontend:**
```bash
cd frontend
```

**2. Cài đặt các thư viện phụ thuộc (node_modules):**
```bash
npm install
```

**3. Khởi chạy Development Server:**
```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập thủ công vào địa chỉ: `http://localhost:5173`.

## ⚙️ Cấu hình API Endpoint

Địa chỉ kết nối đến Backend API được cấu hình thông qua các biến môi trường trong file cấu hình build Docker hoặc cấu hình Vite.
* `VITE_API_BASE_URL`: API Server (Ví dụ: `http://localhost:5000/api`)
* `VITE_SIGNALR_HUB_URL`: SignalR Hub (Ví dụ: `http://localhost:5000/hubs/notification`)
