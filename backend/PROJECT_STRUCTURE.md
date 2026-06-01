# Cấu Trúc Dự Án TuneVault Backend

## 📁 Tổng Quan Cấu Trúc Thư Mục

Dự án sử dụng kiến trúc **Clean Architecture** với 4 layer chính:

---

## 🎯 Các Folder Chính

### 1. **TuneVault.API** 🔌
**Mục đích**: Tầng Presentation (Giao diện API)

Chứa các endpoint HTTP và cấu hình ứng dụng:
- **Controllers/**: Định nghĩa các API endpoints
  - `UsersController.cs` - Quản lý các request liên quan đến users
- **appsettings.json**: Cấu hình ứng dụng (database, logging, v.v.)
- **appsettings.Development.json**: Cấu hình riêng cho môi trường Development
- **Program.cs**: Entry point của ứng dụng, khởi tạo dependency injection và middleware
- **Dockerfile**: Tệp dùng để build container Docker cho API
- **TuneVault.API.http**: File định nghĩa các HTTP request test
- **bin/**, **obj/**: Thư mục build output (tự động sinh ra)

**Trách nhiệm**: Tiếp nhận request từ client, gọi đúng service logic, và trả về response

---

### 2. **TuneVault.Application** 🛠️
**Mục đích**: Tầng Application (Logic ứng dụng)

Chứa business logic và use cases:
- **Features/**: Nhóm các tính năng theo nghiệp vụ
  - `Users/`: Features liên quan đến quản lý users
    - `Queries/`: Xử lý các truy vấn (SELECT)
      - `GetAllUsersQuery.cs` - Định nghĩa query lấy tất cả users
      - `GetAllUsersQueryHandler.cs` - Xử lý logic lấy dữ liệu users
- **Repositories/**: Định nghĩa các interface repository
  - `IUserRepository.cs` - Giao diện cho các operation liên quan đến User
- **bin/**, **obj/**: Thư mục build output

**Trách nhiệm**: Chứa use cases, business rules, validation logic

---

### 3. **TuneVault.Domain** 📊
**Mục đích**: Tầng Domain (Model dữ liệu cốt lõi)

Định nghĩa các entity và business rules cơ bản:
- **Entities/**: Các model đại diện cho dữ liệu trong hệ thống
  - `Album.cs` - Entity cho Album nhạc
  - `Artist.cs` - Entity cho Nghệ sĩ
  - `Favorite.cs` - Entity cho Bài hát yêu thích
  - `Follow.cs` - Entity cho quan hệ theo dõi
  - `MediaItem.cs` - Entity cho mục media (bài hát, podcast, v.v.)
  - `MediaShare.cs` - Entity chia sẻ media
  - `MediaTag.cs` - Entity gắn tag vào media
  - `Notification.cs` - Entity thông báo
  - `PlayHistory.cs` - Entity lịch sử phát nhạc
  - `Playlist.cs` - Entity playlist
  - `PlaylistTrack.cs` - Entity track trong playlist
  - `Tag.cs` - Entity thẻ/tag
  - `UserProfile.cs` - Entity hồ sơ người dùng
- **Enums/**: Các enum (kiểu dữ liệu hạn chế)
  - `MediaType.cs` - Enum loại media (Song, Podcast, v.v.)
  - `NotificationType.cs` - Enum loại thông báo
- **bin/**, **obj/**: Thư mục build output

**Trách nhiệm**: Định nghĩa cấu trúc dữ liệu, không chứa logic ứng dụng

---

### 4. **TuneVault.Infrastructure** 🔧
**Mục đích**: Tầng Infrastructure (Truy cập dữ liệu và external services)

Chứa việc triển khai (implementation) cụ thể:
- **Repositories/**: Triển khai các interface repository
  - `UserRepository.cs` - Thực hiện các database operation cho User (CRUD)
- **bin/**, **obj/**: Thư mục build output

**Trách nhiệm**: Kết nối database, gọi external APIs, xử lý I/O

---

## 🏗️ Sơ Đồ Kiến Trúc

```
                    ┌──────────────────┐
                    │   Frontend       │ (React/TypeScript)
                    └────────┬─────────┘
                             │ HTTP Requests
                    ┌────────▼─────────┐
                    │  TuneVault.API   │ (Controllers, Input/Output)
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │TuneVault.         │ (Queries, Handlers,
                    │Application       │  Business Logic)
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐   ┌─────────▼──────┐  ┌────────▼──────┐
│TuneVault.    │   │TuneVault.      │  │TuneVault.     │
│Infrastructure│   │Domain          │  │...            │
│(DB Access)   │   │(Models)        │  └───────────────┘
└──────────────┘   └────────────────┘
```

---

## 📝 Luồng Dữ Liệu

1. **Client** gửi request HTTP tới API
2. **Controller** (TuneVault.API) nhận request
3. **Handler** (TuneVault.Application) xử lý business logic
4. **Repository** (TuneVault.Infrastructure) truy cập database
5. **Entity** (TuneVault.Domain) đại diện dữ liệu
6. Response trả về client

---

## 🔑 Quy Ước Đặt Tên

| Thư mục | Chức năng | Ví dụ |
|---------|----------|-------|
| **Controllers** | HTTP endpoints | `UsersController.cs` |
| **Features** | Organize use cases bằng domain | `Users/Queries/` |
| **Queries** | Chỉ đọc dữ liệu | `GetAllUsersQuery.cs` |
| **Handlers** | Xử lý logic | `GetAllUsersQueryHandler.cs` |
| **Entities** | Database models | `User.cs`, `Album.cs` |
| **Enums** | Kiểu enumeration | `MediaType.cs` |
| **Repositories** | Data access abstraction | `IUserRepository.cs` |

---

## 📦 Sự Phụ Thuộc Giữa Các Layer

```
TuneVault.API 
    ↓ depends on
TuneVault.Application 
    ↓ depends on
TuneVault.Domain + TuneVault.Infrastructure
```

- **API** import từ **Application**
- **Application** import từ **Domain** và **Infrastructure**
- **Domain** không import từ layer nào
- **Infrastructure** import từ **Domain**

---

## 🚀 Cách Thêm Feature Mới

1. Tạo folder trong `Features/FeatureName/`
2. Tạo `Queries/` hoặc `Commands/` folder
3. Tạo `Handler` để xử lý logic
4. Tạo endpoint trong `Controllers/`
5. Tạo `Entity` trong `Domain/Entities/`
6. Tạo `Repository` implementation trong `Infrastructure/`

---

**Kiến trúc này giúp code dễ bảo trì, test, và mở rộng! 🎉**
