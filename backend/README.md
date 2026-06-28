# ⚙️ TuneVault Backend API

Phần này mô tả chi tiết cách thiết lập, cấu hình và chạy backend của hệ thống **TuneVault**. 
Backend được xây dựng bằng kiến trúc **Clean Architecture**, .NET 10, SQL Server, và SignalR.

---

## 1. Yêu cầu hệ thống (Local)

Nếu bạn không chạy qua Docker, máy tính cần cài đặt:
- **.NET 10 SDK** (hoặc mới nhất)
- (Tùy chọn) SQL Server nếu muốn host db local. Tuy nhiên, project đã cấu hình trỏ thẳng lên database trên Azure.

---

## 2. Cấu hình biến môi trường (`appsettings.json`)

Toàn bộ cấu hình hệ thống nằm trong file `TuneVault.API/appsettings.json`.
Bạn không nên commit file này nếu chứa password thật, nhưng với mục đích đồ án, các thông số hiện tại như sau:

| Node cấu hình | Giải thích |
|---|---|
| `ConnectionStrings.DefaultConnection` | Chuỗi kết nối tới SQL Server (Azure). Bao gồm thông tin Server, User ID, Password. |
| `JwtSettings.Secret` | Chuỗi bí mật dùng để ký và giải mã JWT Token (Không được để lộ trên production). |
| `JwtSettings.ExpiryInMinutes` | Thời gian sống của Token (60 phút). |
| `CloudinarySettings.CloudName` | Tên cloud Cloudinary dùng để lưu trữ media (âm thanh, video, hình ảnh). |
| `CloudinarySettings.ApiKey` | API Key kết nối tới Cloudinary. |
| `CloudinarySettings.ApiSecret` | API Secret kết nối tới Cloudinary. |
| `EmailSettings.SmtpServer` | Server gửi email OTP (`smtp.gmail.com`). |
| `EmailSettings.SenderEmail` | Email gửi đi (`vinhgamingyt@gmail.com`). |
| `EmailSettings.AppPassword` | Mật khẩu ứng dụng 2 lớp của Gmail để gửi mail tự động. |
| `CorsSettings.AllowedOrigins` | Cấu hình tên miền frontend được phép gọi API (mặc định `http://localhost:3000` hoặc `http://localhost:5173`). |

**Lưu ý quan trọng**:
Nếu bạn fork dự án này, hãy đổi thông tin `CloudinarySettings` và `EmailSettings` sang tài khoản của bạn.

---

## 3. Khởi chạy dự án

### Chạy qua lệnh Terminal (CLI)
Mở terminal, trỏ vào thư mục chứa project API (`backend/TuneVault.API`) và chạy:

```bash
cd TuneVault.API
dotnet restore
dotnet run
```
API sẽ lắng nghe tại `http://localhost:5000`.

### Xem tài liệu API (Swagger)
Khi backend đã chạy thành công, truy cập:
`http://localhost:5000/swagger`

---

## 4. Kiến trúc và Tính năng
Vui lòng tham khảo file `PROJECT_STRUCTURE.md` và `API_Contract.md` để hiểu sâu về cách chia layer (Clean Architecture) và các Endpoint RESTful hiện có.
