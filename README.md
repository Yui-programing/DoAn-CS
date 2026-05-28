## 🚀 Hướng dẫn Thiết lập & Khởi chạy Nhanh (Local Setup)

Dự án này đã được đóng gói hoàn chỉnh bằng Docker. Bạn không cần cài đặt .NET hay Node.js trên máy tính cá nhân để chạy dự án.

**1. Yêu cầu Hệ thống (Prerequisites)**
* **Git:** Dùng để tải mã nguồn.
* **Docker Desktop:** Đảm bảo phần mềm Docker đã được cài đặt và đang chạy ngầm trên máy.

**2. Tải mã nguồn về máy (Clone)**
Mở Terminal (hoặc Command Prompt/PowerShell), di chuyển đến thư mục bạn muốn lưu code và chạy lệnh:
`git clone https://github.com/TEN_GITHUB_CUA_BAN/DoAn-CS.git`
`cd DoAn-CS`

**3. Khởi chạy toàn bộ hệ thống (Run with Docker)**
Tại thư mục gốc `DoAn-CS` (nơi chứa file `docker-compose.yml`), thực thi câu lệnh dưới đây để tự động cài đặt và chạy toàn bộ hệ thống:
`docker-compose up -d --build`
*(Lưu ý: Lần chạy đầu tiên sẽ mất vài phút để Docker tải SQL Server, .NET 10 và Node 24 về máy).*

**4. Kiểm tra và Truy cập Hệ thống**
Sau khi lệnh chạy xong và không báo lỗi, bạn mở trình duyệt web lên và truy cập vào:
* **Giao diện người dùng (React Frontend):** http://localhost:3000
* **Tài liệu API (Swagger Backend):** http://localhost:5000/swagger

**5. Cập nhật Cơ sở dữ liệu (Database Migration)**
Vì cơ sở dữ liệu SQL Server trong Docker là một môi trường hoàn toàn mới và trống rỗng, bạn cần chạy Migration để tạo các bảng (Users, Playlists, MediaItems...) trước khi dùng chức năng Đăng ký/Đăng nhập:
* Mở solution bằng **Visual Studio**.
* Mở cửa sổ **Package Manager Console**.
* Đổi **Default Project** thành `TuneVault.Infrastructure`.
* Gõ lệnh: `Update-Database` và nhấn Enter.
