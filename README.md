# 🎵 TuneVault — Nền tảng nghe nhạc & xem MV trực tuyến

TuneVault là hệ thống nghe nhạc và xem MV trực tuyến lấy cảm hứng từ Spotify.
Dự án hỗ trợ người dùng khám phá âm nhạc, tạo playlist cá nhân, xem video, tương tác theo dõi nghệ sĩ, chia sẻ bài hát, và có trang quản trị dành riêng cho hệ thống.

Hệ thống gồm hai phần chính:
- **backend**: ASP.NET Core RESTful API sử dụng Clean Architecture.
- **frontend**: React + Vite + TypeScript web app.

Backend xử lý nghiệp vụ, xác thực, kết nối SQL Server và cung cấp RESTful API qua Docker. Frontend gồm giao diện cho người dùng bình thường, artist và trang quản lý admin.

---

## 1. Mục tiêu dự án

Dự án được xây dựng nhằm mang lại trải nghiệm nghe nhạc, xem MV trực tuyến mượt mà và trực quan.

Các mục tiêu chính:
- Phát nhạc liên tục với player bar.
- Quản lý tài khoản (Đăng nhập, Đăng ký OTP, cấp quyền User/Artist/Admin).
- Giao diện thân thiện, tìm kiếm, lưu thư viện nhạc cá nhân và theo dõi nghệ sĩ.
- Quản trị toàn diện: người dùng, duyệt bài hát, xóa nội dung, dashboard thống kê.
- Tính năng real-time: Thông báo khi có bài hát mới hoặc được chia sẻ nhạc qua SignalR.

---

## 2. Chức năng chính

### Public app (User / Artist)
- Đăng ký bằng OTP qua Email, đăng nhập.
- Phát audio, xem MV toàn màn hình.
- Thả tim bài hát, follow nghệ sĩ.
- Tạo, sửa, xóa playlist (đặt chế độ riêng tư hoặc công khai).
- Upload Avatar, Banner, cập nhật Bio cá nhân.
- (Artist) Đăng tải nhạc, video chờ hệ thống kiểm duyệt.
- Tìm kiếm nhạc, nghệ sĩ, album.
- Chia sẻ nhạc cho người dùng khác (hộp thư đến inbox).
- Xem playlist công khai của user khác.

### Admin app
- Đăng nhập quyền admin.
- Quản lý và khóa/mở khóa người dùng.
- Xét duyệt bài hát, MV do artist upload (Approve/Reject).
- Quản lý tất cả playlist, media trên hệ thống.
- Dashboard thống kê tổng quan (users, plays, tracks).

---

## 3. Công nghệ sử dụng

**Backend**
- ASP.NET Core 10 Web API
- C#
- MediatR (CQRS)
- FluentValidation
- Dapper
- SignalR
- BCrypt.Net

**Frontend**
- React 19
- Vite
- TypeScript
- TailwindCSS v4
- React Router DOM v7
- Axios
- Lucide React
- SignalR Client

**Database & Dịch vụ ngoài**
- SQL Server 2022
- Cloudinary (Lưu trữ ảnh, âm thanh, video)

---

## 4. Cấu trúc project

```text
DoAn-CS/
│
├── backend/
│   ├── TuneVault.API/
│   ├── TuneVault.Application/
│   ├── TuneVault.Domain/
│   ├── TuneVault.Infrastructure/
│   ├── API_Contract.md
│   ├── PROJECT_STRUCTURE.md
│   ├── README.md
│   └── TuneVault.slnx
│
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   ├── README.md
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 5. Yêu cầu cài đặt

Trước khi chạy project, máy cần có:
- **Git**
- **Docker Desktop** (Đã cài và đang chạy)
- (Tùy chọn) Node.js và .NET 10 SDK nếu không dùng Docker.

Kiểm tra nhanh:
```bash
docker -v
docker compose version
```

---

## 6. Clone project

```bash
git clone https://github.com/Yui-programing/DoAn-CS.git
cd DoAn-CS
```

---

## 7. Hướng dẫn cấu hình

Project có 3 README chính:
- `README.md` (file này): Tổng quan project và cách khởi chạy.
- `backend/README.md`: Hướng dẫn cấu hình và chạy backend.
- `frontend/README.md`: Hướng dẫn cấu hình và chạy frontend.

Cấu hình database, thư viện Cloudinary, Mail Server được mô tả chi tiết trong `backend/README.md`.
Cấu hình API endpoint, port frontend được mô tả chi tiết trong `frontend/README.md`.

---

## 8. Chạy nhanh toàn bộ project (Docker)

```bash
docker compose up -d --build
```
> ⚠️ Lần chạy đầu tiên sẽ mất vài phút để tải ảnh SQL Server, .NET, Node.js.

- **Backend (API + Swagger)** chạy tại: `http://localhost:5000/swagger`
- **Frontend** chạy tại: `http://localhost:3000`

---

## 9. Hướng dẫn chạy Local (Không dùng Docker)

Nếu bạn muốn debug trực tiếp, hãy chạy độc lập backend và frontend.

**Terminal 1: chạy backend**
```bash
cd backend/TuneVault.API
dotnet restore
dotnet run
```
> Backend mặc định chạy tại: `http://localhost:5000`

**Terminal 2: chạy frontend**
```bash
cd frontend
npm install
npm run dev
```
> Frontend mặc định chạy tại: `http://localhost:5173`

---

## 10. Connection String & Cấu hình

Connection string mặc định trong `backend/TuneVault.API/appsettings.json`:
```json
"ConnectionStrings": {
    "DefaultConnection": "Server=tcp:tunevault-sql-server.database.windows.net,1433;Initial Catalog=TuneVaultDb;Persist Security Info=False;User ID=adminsql;Password=Tunevault_db;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
}
```
*Lưu ý: Database này đã được host trên Azure, bạn không cần cài SQL Server local nếu có Internet.*

---

## 11. Tài khoản mẫu (Seed Data)

Dùng các tài khoản sau để đăng nhập thử nghiệm hệ thống:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Admin** | `admin@tunevault.local` | `Admin@123` |
| **Artist** (Sơn Tùng M-TP) | `sontung@tunevault.local` | `Sontung@123` |
| **User** | `user@tunevault.local` | `User@123` |

---

## 12. Ghi chú demo

Khi demo, nên kiểm tra các flow chính:
1. Đăng nhập bằng tài khoản Artist (Sơn Tùng).
2. Tạo nhạc/MV mới, chờ kiểm duyệt.
3. Đăng nhập tài khoản Admin, vào bảng điều khiển duyệt bài hát.
4. Đăng nhập tài khoản User, tìm kiếm nghệ sĩ Sơn Tùng, xem profile và phát nhạc.
5. User chia sẻ bài hát cho một tài khoản khác qua tính năng Inbox.
6. User tạo playlist, set chế độ Công khai, người dùng khác vào Profile sẽ thấy playlist đó.
