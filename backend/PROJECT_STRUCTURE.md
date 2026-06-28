# Cấu Trúc Dự Án TuneVault Backend

## 📁 Tổng Quan

Dự án sử dụng kiến trúc **Clean Architecture** với 4 layer rõ ràng, mỗi layer chỉ phụ thuộc vào layer bên dưới nó.

---

## 🎯 Các Layer Chính

### 1. **TuneVault.API** 🔌 — Presentation Layer

Tiếp nhận và xử lý HTTP requests, trả về responses:

```
TuneVault.API/
├── Program.cs                          # Entry point, cấu hình DI và middleware pipeline
├── Dockerfile                          # Docker build image cho API
├── appsettings.json                    # Cấu hình production (JWT, Cloudinary, DB...)
├── appsettings.Development.json        # Cấu hình môi trường dev
├── Common/
│   └── ApiResponse.cs                  # Wrapper chuẩn hóa mọi response JSON
├── Controllers/
│   ├── AdminController.cs              # Quản lý users (role, active state)
│   ├── AlbumsController.cs             # CRUD album
│   ├── ArtistsController.cs            # Thông tin nghệ sĩ
│   ├── AuthController.cs               # Đăng ký, đăng nhập, OTP, reset mật khẩu
│   ├── FavoritesController.cs          # Thả tim / bỏ tim bài hát
│   ├── FollowsController.cs            # Follow / Unfollow nghệ sĩ
│   ├── HistoryController.cs            # Lịch sử nghe nhạc
│   ├── InboxController.cs              # Hộp thư chia sẻ nhạc
│   ├── MediaController.cs              # Upload, stream, xem chi tiết media
│   ├── NotificationsController.cs      # Thông báo real-time
│   ├── PlaylistsController.cs          # CRUD playlist và tracks trong playlist
│   ├── SearchController.cs             # Tìm kiếm toàn hệ thống
│   ├── ShareController.cs              # Chia sẻ nhạc/playlist/album cho người khác
│   └── UsersController.cs              # Hồ sơ người dùng, đăng ký Artist
└── Middlewares/
    └── ExceptionHandlingMiddleware.cs  # Bắt lỗi toàn cục, trả về lỗi chuẩn JSON
```

---

### 2. **TuneVault.Application** 🛠️ — Business Logic Layer

Chứa toàn bộ business logic theo pattern **CQRS (MediatR)**:

```
TuneVault.Application/
├── Features/
│   ├── Admin/                          # Quản lý users (GetAll, SetRole, SetActive)
│   ├── Artists/                        # Xem thông tin nghệ sĩ
│   ├── Auth/
│   │   └── Commands/
│   │       ├── Login/                  # LoginCommand + Handler + Validator
│   │       ├── Register/               # RegisterCommand + Handler + Validator
│   │       ├── SendRegistrationOtp/    # Gửi OTP đăng ký
│   │       ├── SendForgotPasswordOtp/  # Gửi OTP quên mật khẩu
│   │       └── ResetPassword/          # Đặt lại mật khẩu
│   ├── Favorites/                      # Thả tim, bỏ tim, lấy danh sách yêu thích
│   ├── Follows/                        # Follow, Unfollow, kiểm tra trạng thái
│   ├── History/                        # Ghi nhận & lấy lịch sử nghe
│   ├── Medias/                         # Upload media, stream, lấy chi tiết
│   ├── Notifications/                  # Lấy thông báo, đánh dấu đã đọc
│   ├── Playlists/                      # CRUD playlist, thêm/xóa tracks
│   ├── Query/                          # Shared queries dùng chung
│   ├── Share/                          # Chia sẻ nhạc/playlist/album, Inbox
│   └── Users/                          # Hồ sơ người dùng, đăng ký Artist
├── Models/                             # DTOs dùng để trả dữ liệu về Frontend
│   ├── MediaItemDto.cs
│   ├── MyPlaylistDto.cs
│   ├── PlaylistTrackDto.cs
│   ├── ShareDto.cs
│   └── ...
├── Repositories/                       # Interfaces cho tầng Infrastructure
│   ├── IUserRepository.cs
│   ├── IMediaRepository.cs
│   ├── IPlaylistRepository.cs
│   ├── ISharedRepository.cs
│   └── ...
└── DependencyInjection.cs              # Đăng ký MediatR, FluentValidation
```

---

### 3. **TuneVault.Domain** 📊 — Domain Layer

Định nghĩa các entity cốt lõi, **không phụ thuộc bất kỳ layer nào**:

```
TuneVault.Domain/
├── Entities/
│   ├── Album.cs                # Entity album nhạc
│   ├── Artist.cs               # Entity nghệ sĩ
│   ├── Favorite.cs             # Entity bài hát yêu thích
│   ├── Follow.cs               # Entity quan hệ follow
│   ├── MediaItem.cs            # Entity media (bài hát, video)
│   ├── MediaShare.cs           # Entity chia sẻ media
│   ├── MediaTag.cs             # Entity gắn tag cho media
│   ├── Notification.cs         # Entity thông báo
│   ├── PlayHistory.cs          # Entity lịch sử phát nhạc
│   ├── Playlist.cs             # Entity playlist
│   ├── PlaylistTrack.cs        # Entity bài hát trong playlist
│   ├── Tag.cs                  # Entity tag/thẻ
│   ├── User.cs                 # Entity người dùng
│   └── UserProfile.cs          # Entity hồ sơ người dùng (quan hệ 1-1 với User)
└── Enums/
    ├── MediaType.cs            # Enum: Song, Video, Podcast...
    └── NotificationType.cs     # Enum: NewFollow, NewShare...
```

---

### 4. **TuneVault.Infrastructure** 🔧 — Infrastructure Layer

Triển khai cụ thể việc kết nối DB, cloud storage, real-time:

```
TuneVault.Infrastructure/
├── DependencyInjection.cs          # Đăng ký tất cả services vào DI container
├── Configurations/
│   └── CloudinarySettings.cs       # Config Cloudinary (CloudName, ApiKey, ApiSecret)
├── Hubs/
│   └── NotificationHub.cs          # SignalR Hub — gửi thông báo real-time
├── Repositories/                   # Triển khai các IRepository dùng Dapper + SQL Server
│   ├── UserRepository.cs
│   ├── MediaRepository.cs
│   ├── PlaylistRepository.cs
│   ├── FavoriteRepository.cs
│   ├── FollowRepository.cs
│   ├── HistoryRepository.cs
│   ├── NotificationRepository.cs
│   └── SharedRepository.cs
└── Services/
    └── CloudinaryService.cs        # Upload ảnh/audio/video lên Cloudinary
```

---

## 🏗️ Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────┐
│           Frontend (React + TypeScript)      │
│              http://localhost:3000            │
└────────────────────┬────────────────────────┘
                     │ HTTP Requests (Axios)
                     │ WebSocket (SignalR)
┌────────────────────▼────────────────────────┐
│         TuneVault.API (Controllers)          │
│           http://localhost:5000              │
│     Middleware: JWT Auth, Exception Handler  │
└────────────────────┬────────────────────────┘
                     │ MediatR (Commands/Queries)
┌────────────────────▼────────────────────────┐
│       TuneVault.Application (Handlers)       │
│   FluentValidation → Business Logic → DTO   │
└────────┬───────────────────────┬────────────┘
         │                       │
┌────────▼──────────┐   ┌────────▼──────────┐
│ TuneVault.Domain  │   │TuneVault.          │
│ (Entities, Enums) │   │Infrastructure      │
│  Pure C# Classes  │   │(Dapper, Cloudinary,│
└───────────────────┘   │ SignalR)           │
                        └───────────────────┘
```

---

## 📝 Luồng Xử Lý Request

```
Client → Controller → MediatR.Send(Command/Query)
       → ValidationBehavior (FluentValidation)
       → Handler (Business Logic)
       → Repository (Dapper SQL)
       → SQL Server
       → DTO mapping
       → ApiResponse<T>.SetSuccess(data, message)
       → JSON response
```

---

## 🔑 Quy Ước Đặt Tên

| Loại file | Pattern | Ví dụ |
|---|---|---|
| Command | `{Action}{Entity}Command.cs` | `CreatePlaylistCommand.cs` |
| Query | `{Action}{Entity}Query.cs` | `GetPlaylistByIdQuery.cs` |
| Handler | `{...}Handler.cs` | `CreatePlaylistHandler.cs` |
| Validator | `{...}Validator.cs` | `CreatePlaylistValidator.cs` |
| Repository (interface) | `I{Entity}Repository.cs` | `IPlaylistRepository.cs` |
| Repository (impl) | `{Entity}Repository.cs` | `PlaylistRepository.cs` |
| Controller | `{Entity}Controller.cs` | `PlaylistsController.cs` |
| DTO | `{Entity}Dto.cs` | `MyPlaylistDto.cs` |

---

## 📦 Sự Phụ Thuộc Giữa Các Layer

```
TuneVault.API
    ↓ depends on
TuneVault.Application
    ↓ depends on
TuneVault.Domain
    ↑ also used by
TuneVault.Infrastructure
```

- **API** phụ thuộc **Application**
- **Application** phụ thuộc **Domain**
- **Infrastructure** phụ thuộc **Domain** (implement interfaces của Application)
- **Domain** không phụ thuộc bất kỳ layer nào

---

**Kiến trúc này giúp code dễ bảo trì, test, và mở rộng! 🎉**
