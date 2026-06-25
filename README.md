# 🎵 TuneVault — Nền tảng nghe nhạc & xem MV trực tuyến

TuneVault là ứng dụng web nghe nhạc và xem MV trực tuyến lấy cảm hứng từ Spotify, xây dựng bằng **React + TypeScript** (Frontend) và **.NET 10 Clean Architecture** (Backend), triển khai hoàn toàn qua **Docker**.

---

## 🚀 Hướng dẫn Thiết lập & Khởi chạy Nhanh (Local Setup)

Dự án này đã được đóng gói hoàn chỉnh bằng Docker. Bạn **không cần** cài đặt .NET hay Node.js trên máy tính cá nhân để chạy dự án.

### Yêu cầu Hệ thống (Prerequisites)
- **Git** — Dùng để tải mã nguồn
- **Docker Desktop** — Đảm bảo phần mềm Docker đã được cài đặt và đang chạy

### Các bước khởi chạy

**1. Tải mã nguồn về máy (Clone)**
```bash
git clone https://github.com/Yui-programing/DoAn-CS.git
cd DoAn-CS
```

**2. Khởi chạy toàn bộ hệ thống**
```bash
docker compose up -d --build
```
> ⚠️ Lần chạy đầu tiên sẽ mất vài phút để Docker tải SQL Server, .NET 10 và Node 24 về máy.

**3. Truy cập Hệ thống**

| Dịch vụ | URL |
|---|---|
| 🌐 Giao diện React Frontend | http://localhost:3000 |
| 📖 Tài liệu API (Swagger) | http://localhost:5000/swagger |

---

## 📁 Cấu trúc Thư mục

```
DoAn-CS/
├── 📄 docker-compose.yml           # Orchestration toàn bộ services
├── 📄 README.md                    # Tài liệu dự án (file này)
│
├── 📁 backend/                     # .NET 10 Clean Architecture API
│   ├── 📄 API_Contract.md          # Định nghĩa API contract
│   ├── 📄 PROJECT_STRUCTURE.md     # Chi tiết kiến trúc backend
│   ├── 📁 TuneVault.API/           # Presentation layer (Controllers, Middlewares)
│   ├── 📁 TuneVault.Application/   # Business logic layer (Features, Handlers)
│   ├── 📁 TuneVault.Domain/        # Domain layer (Entities, Enums)
│   └── 📁 TuneVault.Infrastructure/# Data access layer (Repositories, Services)
│
└── 📁 frontend/                    # React 19 + TypeScript + TailwindCSS
    └── 📁 src/
        ├── 📁 components/          # Components dùng chung
        ├── 📁 contexts/            # React Context (Auth, Player, Favorites...)
        ├── 📁 hooks/               # Custom hooks
        ├── 📁 layouts/             # Layout chính (MainLayout)
        ├── 📁 pages/               # Các trang của ứng dụng
        ├── 📁 routes/              # Cấu hình routing
        ├── 📁 services/            # API service layer (axios)
        ├── 📁 types/               # TypeScript interfaces/types
        └── 📁 utils/               # Hàm helper dùng chung
```

---

## 🏗️ Kiến trúc Tầng Backend (Layered Architecture)

| Tầng | Project | Trách nhiệm |
|---|---|---|
| **API Layer** | `TuneVault.API` | HTTP endpoints, middleware, xử lý request/response |
| **Application Layer** | `TuneVault.Application` | Business logic, use cases, validation (MediatR + FluentValidation) |
| **Domain Layer** | `TuneVault.Domain` | Core entities, business rules, enums |
| **Infrastructure Layer** | `TuneVault.Infrastructure` | Database (Dapper), Cloudinary, SignalR Hubs |

---

## ✨ Tính năng Chính

### 🎶 Nghe nhạc & Xem MV
- Phát nhạc liên tục với player bar cố định ở dưới màn hình
- Xem MV với Video Player toàn màn hình tách biệt
- Streaming audio/video trực tiếp từ Cloudinary

### 📋 Playlist & Thư viện
- Tạo, sửa, xóa playlist cá nhân
- Thêm/xóa bài hát khỏi playlist
- Sidebar thư viện với danh sách playlist của mình
- Right-click context menu trên từng bài hát

### 🔍 Tìm kiếm
- Tìm kiếm bài hát, nghệ sĩ, album theo từ khóa
- Kết quả hiển thị theo grid với ảnh thumbnail

### ❤️ Yêu thích & Theo dõi
- Thả tim bài hát — tự động vào danh sách Favorites
- Follow / Unfollow nghệ sĩ
- Trang xem Favorites riêng

### 👤 Hồ sơ Người dùng
- Xem & chỉnh sửa thông tin cá nhân (tên, bio, avatar)
- Xem hồ sơ của người dùng khác
- Đăng ký trở thành Artist (có form upload thông tin)

### 📤 Chia sẻ & Inbox
- Chia sẻ bài hát/playlist/album cho người dùng khác
- Hộp thư đến nhận nhạc được share
- Chat history theo từng người gửi

### 🔔 Thông báo Real-time
- Nhận thông báo qua SignalR (kết nối WebSocket)
- Đánh dấu đã đọc từng thông báo

### 🛠️ Quản trị (Admin)
- Trang Admin quản lý users, media, nội dung
- Kích hoạt/vô hiệu hóa tài khoản
- Phân quyền User/Artist/Admin

---

## ⌨️ Phím tắt Điều khiển (Hotkeys)

### Player Bar (Main Layout)
| Phím | Chức năng |
|---|---|
| `Space` / `Enter` | Phát / Tạm dừng nhạc |
| `ArrowLeft` | Tua lùi 5 giây |
| `ArrowRight` | Tua nhanh 5 giây |

### Video Player
| Phím | Chức năng |
|---|---|
| `Space` / `Enter` | Phát / Tạm dừng video |
| `F` / `f` | Bật/Tắt toàn màn hình |
| `ArrowLeft` | Tua lùi 5 giây |
| `ArrowRight` | Tua nhanh 5 giây |

---

## 🔐 Xác thực & Bảo mật

- Đăng ký qua **OTP Email** (tránh email rác)
- Đăng nhập trả về **JWT Token** lưu trong **HttpOnly Cookie** (chống XSS)
- `SameSite=Strict` trên cookie (chống CSRF)
- Route bảo vệ: trang cần đăng nhập sẽ redirect về `/login`
- Route Admin: chỉ user có role `Admin` mới truy cập được

---

## 🛠️ Công nghệ Sử dụng

### Frontend
- **React 19** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router v7** (routing)
- **Axios** (HTTP client)
- **Lucide React** (icons)
- **SignalR Client** (real-time notifications)

### Backend
- **.NET 10** + **C#**
- **MediatR** (CQRS pattern)
- **FluentValidation** (request validation)
- **Dapper** (micro ORM, kết nối SQL Server)
- **BCrypt.Net** (mã hoá mật khẩu)
- **JWT Bearer** (xác thực token)
- **Cloudinary SDK** (lưu trữ media)
- **SignalR** (real-time WebSocket)

### Database & Infrastructure
- **SQL Server 2022** (database)
- **Cloudinary** (media storage — audio, video, image)
- **Docker & Docker Compose** (containerization)
- **Nginx** (reverse proxy cho frontend)
