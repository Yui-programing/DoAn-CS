# TuneVault — Giao diện Người dùng (React Frontend)

Thư mục này chứa toàn bộ mã nguồn giao diện người dùng của **TuneVault**, nền tảng nghe nhạc và xem MV trực tuyến, xây dựng bằng các công nghệ hiện đại.

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | 19 | Framework UI |
| **TypeScript** | 5+ | Kiểu dữ liệu an toàn |
| **Vite** | 8+ | Build tool siêu nhanh |
| **Tailwind CSS** | v4 | Styling utility-first |
| **React Router** | v7 | Điều hướng SPA |
| **Axios** | latest | HTTP client gọi API |
| **SignalR Client** | @microsoft/signalr | Thông báo real-time |
| **Lucide React** | latest | Bộ icon hiện đại |

---

## 📁 Cấu trúc Thư mục

```
frontend/
├── index.html              # Entry HTML, chứa <div id="root">
├── vite.config.ts          # Cấu hình Vite (proxy API, alias...)
├── tailwind.config.ts      # Cấu hình Tailwind CSS
├── Dockerfile              # Multi-stage build: Node (build) → Nginx (serve)
├── nginx.conf              # Cấu hình Nginx phục vụ SPA
└── src/
    ├── App.tsx             # Root component, bọc tất cả Providers
    ├── main.tsx            # Mount React vào #root
    ├── App.css             # CSS global (font, scrollbar tùy chỉnh...)
    ├── index.css           # Tailwind directives
    │
    ├── assets/             # Tài nguyên tĩnh (logo, favicon, hình ảnh)
    ├── components/         # Components dùng CHUNG toàn dự án
    ├── contexts/           # Global State (Auth, Player, Favorites, Notifications)
    ├── hooks/              # Custom React Hooks
    ├── layouts/            # Layout khung (MainLayout)
    ├── pages/              # Các trang chính
    ├── routes/             # Cấu hình routing + Route Guards
    ├── services/           # API calls (axios)
    ├── types/              # TypeScript interfaces/types dùng chung
    └── utils/              # Hàm helper (formatDuration, formatDate...)
```

> [!NOTE]
> Xem chi tiết giải thích từng thư mục tại [GiaiThich.md](./src/GiaiThich.md).

---

## 📄 Các Trang (Pages)

| Trang | Đường dẫn | Mô tả |
|---|---|---|
| Home | `/` | Trang chủ — danh sách nhạc mới, nghệ sĩ nổi bật |
| Search | `/search` | Tìm kiếm bài hát, nghệ sĩ, album |
| Library | `/library` | Thư viện cá nhân |
| Favorites | `/favorites` | Danh sách bài hát đã thả tim |
| Playlist Detail | `/playlist/:id` | Chi tiết playlist |
| Video Player | `/video/:id` | Xem MV toàn màn hình |
| Profile | `/profile` | Hồ sơ của mình |
| User Profile | `/profile/:id` | Hồ sơ của người dùng khác |
| Share Inbox | `/inbox` | Hộp thư nhận nhạc được chia sẻ |
| Notifications | `/notifications` | Danh sách thông báo |
| Login | `/login` | Đăng nhập |
| Register | `/register` | Đăng ký tài khoản + OTP |
| Forgot Password | `/forgot-password` | Quên mật khẩu + OTP reset |
| Admin | `/admin` | Quản trị hệ thống (chỉ Admin) |

---

## 🚀 Khởi chạy Local (Không qua Docker)

Dùng khi muốn phát triển frontend nhanh với **Hot Module Replacement**:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Truy cập: `http://localhost:5173`

> ⚠️ Khi chạy standalone, cần backend đang chạy riêng tại `http://localhost:5000` hoặc qua Docker. Xem file `vite.config.ts` để cấu hình proxy.

---

## 🐳 Build qua Docker

```bash
# Build và chạy chỉ frontend container
docker compose up -d --no-deps --build tunevault-frontend
```

Truy cập: `http://localhost:3000` (Nginx phục vụ SPA)

---

## ⚙️ Hướng dẫn Cấu hình & Biến Môi trường

Cấu hình API base URL và các tham số khác nằm trong file `.env` (nếu chạy local ngoài Docker) hoặc trong cấu hình của Vite.

| Biến (Prefix `VITE_`) | Ví dụ | Mô tả |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | URL kết nối tới RESTful API Backend |
| `VITE_SIGNALR_HUB_URL` | `http://localhost:5000/hubs/notification` | URL kết nối WebSocket SignalR |

### Khi Deploy Production (ví dụ Vercel)
Khi deploy frontend lên Vercel, bạn cần cấu hình trực tiếp các biến môi trường này trong dashboard của Vercel (phần Settings > Environment Variables):
- Đổi `VITE_API_BASE_URL` trỏ tới Domain Backend Production (ví dụ `https://api.tunevault.com/api`).
- Đổi `VITE_SIGNALR_HUB_URL` trỏ tới Domain Backend Hub Production.

Lưu ý: Không đưa `DATABASE_URL` hoặc secret keys của backend vào frontend. Vite chỉ đọc các biến có tiền tố `VITE_`.

## 🔐 Xác thực

- JWT Token được backend lưu vào **HttpOnly Cookie** (tên `token`) sau khi đăng nhập
- Axios tự động gửi cookie theo mỗi request (`withCredentials: true`)
- Route Guards tự động redirect về `/login` nếu chưa đăng nhập
- Route `/admin` chỉ cho phép user có role `Admin`
