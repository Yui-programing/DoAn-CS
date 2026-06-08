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
`docker compose up -d --build`
*(Lưu ý: Lần chạy đầu tiên sẽ mất vài phút để Docker tải SQL Server, .NET 10 và Node 24 về máy).*

**4. Kiểm tra và Truy cập Hệ thống**
Sau khi lệnh chạy xong và không báo lỗi, bạn mở trình duyệt web lên và truy cập vào:
* **Giao diện người dùng (React Frontend):** http://localhost:3000
* **Tài liệu API (Swagger Backend):** http://localhost:5000/swagger

---

## 📁 Cấu trúc Thư mục Backend

```
backend/
├── 📄 API_Contract.md              # Tài liệu định nghĩa API contracts
├── 📄 TuneVault.slnx               # Solution file (.NET)
│
├── 📁 TuneVault.API/               # 🎯 API Layer (Main Entry Point)
│   ├── 📄 Program.cs               # Cấu hình ứng dụng chính
│   ├── 📄 TuneVault.API.csproj    # Project file
│   ├── 📄 TuneVault.API.http       # HTTP request definitions
│   ├── 📄 appsettings.json         # Cấu hình production
│   ├── 📄 appsettings.Development.json  # Cấu hình development
│   ├── 📄 Dockerfile               # Docker image configuration
│   ├── 📁 Controllers/             # API endpoints
│   ├── 📁 Middlewares/             # Custom middleware components
│   ├── 📁 Common/                  # Utilities & helpers
│   ├── 📁 Properties/              # Project properties
│   ├── 📁 bin/                     # Compiled binaries
│   └── 📁 obj/                     # Build artifacts
│
├── 📁 TuneVault.Application/       # 📋 Business Logic Layer
│   ├── 📄 DependencyInjection.cs   # Dependency injection setup
│   ├── 📄 TuneVault.Application.csproj
│   ├── 📁 Features/                # Business logic & use cases
│   ├── 📁 Models/                  # DTOs & application models
│   ├── 📁 Repositories/            # Repository interfaces
│   ├── 📁 Common/                  # Shared application utilities
│   ├── 📁 bin/                     # Compiled binaries
│   └── 📁 obj/                     # Build artifacts
│
├── 📁 TuneVault.Domain/            # 🏛️ Domain Layer (Business Objects)
│   ├── 📄 TuneVault.Domain.csproj
│   ├── 📁 Entities/                # Core business entities
│   ├── 📁 Enums/                   # Enumeration definitions
│   ├── 📁 bin/                     # Compiled binaries
│   └── 📁 obj/                     # Build artifacts
│
└── 📁 TuneVault.Infrastructure/    # 🔧 Infrastructure Layer (Data Access)
    ├── 📄 DependencyInjection.cs   # Infrastructure IoC configuration
    ├── 📄 TuneVault.Infrastructure.csproj
    ├── 📁 Repositories/            # Data access implementations
    ├── 📁 bin/                     # Compiled binaries
    └── 📁 obj/                     # Build artifacts
```

### 🏗️ Kiến trúc tầng (Layered Architecture)

| Tầng | Thư mục | Chức năng |
|------|---------|----------|
| **API Layer** | `TuneVault.API` | HTTP endpoints, middleware, request handling |
| **Application Layer** | `TuneVault.Application` | Business logic, use cases, DTOs |
| **Domain Layer** | `TuneVault.Domain` | Core entities, business rules, enums |
| **Infrastructure Layer** | `TuneVault.Infrastructure` | Database, repositories, external services |


