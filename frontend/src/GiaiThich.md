# Cấu trúc Frontend — TuneVault

Tài liệu mô tả cấu trúc thư mục `src/` và quy ước tổ chức code của frontend.

---

## 📁 Cấu trúc thư mục `src/`

```
src/
├── App.css                     # CSS global (scrollbar, font, reset...)
├── App.tsx                     # Root component, cấu hình providers
├── index.css                   # Tailwind directives (@tailwind base/components/utilities)
├── main.tsx                    # Entry point — mount React app vào #root
│
├── assets/                     # Hình ảnh, icons tĩnh (logo, favicon...)
│
├── components/                 # Components dùng CHUNG cho toàn dự án
│   ├── index.ts                # Re-export tất cả components
│   ├── CommonButton/           # Nút chung có style chuẩn
│   ├── AddToPlaylistModal.tsx  # Modal thêm bài hát vào playlist
│   ├── AdminProtectedRoute.tsx # Route guard chỉ cho phép Admin
│   ├── ContextMenu.tsx         # Menu chuột phải (right-click context menu)
│   ├── CreateAlbumModal.tsx    # Modal tạo album (Artist)
│   ├── CreatePlaylistModal.tsx # Modal tạo playlist mới
│   ├── MarqueeText.tsx         # Component chữ chạy khi text bị tràn
│   ├── NotificationBell.tsx    # Chuông thông báo ở header
│   ├── ProtectedRoute.tsx      # Route guard yêu cầu đăng nhập
│   ├── RegisterArtistModal.tsx # Modal đăng ký trở thành Artist
│   ├── RightPanel.tsx          # Panel bên phải (ShareInbox, Chat...)
│   ├── ShareModal.tsx          # Modal chia sẻ nhạc/playlist/album
│   ├── TrackDropdownMenu.tsx   # Dropdown menu của từng bài hát
│   ├── TrackListTable.tsx      # Bảng danh sách bài hát (có cột #, title, artist...)
│   └── UploadMediaModal.tsx    # Modal upload bài hát/video lên Cloudinary
│
├── contexts/                   # Global State bằng React Context API
│   ├── index.ts
│   ├── AuthContext.tsx          # Trạng thái đăng nhập (isAuthenticated, user info)
│   ├── FavoriteContext.tsx      # Danh sách bài hát đã thả tim
│   ├── NotificationContext.tsx  # Thông báo real-time (SignalR)
│   └── PlayerContext.tsx        # Trạng thái player (bài đang phát, queue, volume...)
│
├── hooks/                      # Custom React Hooks
│   └── ...                     # (useDebounce, useLocalStorage, useSignalR...)
│
├── layouts/                    # Layout khung dùng chung
│   └── MainLayout.tsx          # Layout chính: Sidebar + Player Bar + Content Area
│
├── pages/                      # Các trang của ứng dụng (1 folder = 1 trang)
│   ├── Admin/                  # Trang quản trị (chỉ Admin)
│   ├── Favorites/              # Trang bài hát yêu thích
│   ├── ForgotPassword/         # Quên mật khẩu + OTP reset
│   ├── Home/                   # Trang chủ (danh sách nhạc mới, nghệ sĩ...)
│   ├── Library/                # Thư viện cá nhân
│   ├── Login/                  # Đăng nhập
│   ├── Notifications/          # Trang thông báo
│   ├── PlaylistDetail/         # Chi tiết playlist (danh sách bài hát trong playlist)
│   ├── Profile/                # Hồ sơ người dùng (của mình và người khác)
│   ├── Register/               # Đăng ký tài khoản + OTP
│   ├── Search/                 # Tìm kiếm
│   ├── ShareInbox/             # Hộp thư chia sẻ nhạc
│   └── VideoPlayer/            # Xem MV (Video Player toàn màn hình)
│
├── routes/                     # Cấu hình định tuyến
│   └── AppRoutes.tsx           # Định nghĩa tất cả routes + bảo vệ route
│
├── services/                   # API service layer (axios calls)
│   ├── index.ts
│   ├── api.ts                  # Axios instance, interceptors (tự gắn cookie)
│   ├── adminService.ts         # Gọi API quản trị (users, roles)
│   ├── albumService.ts         # Gọi API album
│   ├── authService.ts          # Đăng nhập, đăng ký, OTP, logout
│   ├── followService.ts        # Follow / Unfollow nghệ sĩ
│   ├── inboxService.ts         # Lấy hộp thư, lịch sử chat
│   ├── mediaService.ts         # Upload, stream, lấy chi tiết media
│   ├── notificationService.ts  # Lấy thông báo, đánh dấu đọc
│   ├── playlistService.ts      # CRUD playlist, thêm/xóa tracks
│   ├── shareService.ts         # Chia sẻ nhạc/playlist/album
│   └── userService.ts          # Hồ sơ người dùng, đăng ký Artist
│
├── types/                      # TypeScript interfaces & types dùng chung
│   └── ...                     # (MediaItem, Playlist, User, ApiResponse...)
│
└── utils/                      # Hàm helper bổ trợ
    └── ...                     # (formatDuration, formatDate, truncate...)
```

---

## 📐 Quy ước Tổ chức Code

### Cấu trúc 1 Page

```
pages/Home/
├── Home.tsx            # UI chính của trang (JSX)
├── useHome.ts          # Custom hook chứa toàn bộ logic & state của trang
└── components/         # Components chỉ dùng riêng cho trang Home
    └── HomeSection.tsx
```

### Nguyên tắc chung

| Quy tắc | Chi tiết |
|---|---|
| **Tách logic khỏi UI** | Logic nặng để trong `usePageName.ts`, UI clean trong `Page.tsx` |
| **Component dùng lại** | Bỏ vào `/components/`, export qua `index.ts` |
| **Component dùng 1 trang** | Bỏ vào `pages/PageName/components/` |
| **Global state** | Dùng Context API trong `/contexts/` |
| **Gọi API** | Chỉ gọi qua `/services/`, không gọi axios trực tiếp trong component |
| **Type safety** | Định nghĩa interface trong `/types/`, tránh dùng `any` |

---

## 🔄 Luồng Dữ liệu

```
User Action (click/input)
    ↓
Component (Page.tsx) → gọi hàm từ usePageName.ts
    ↓
Service (services/xxxService.ts) → axios.get/post...
    ↓
Backend API (http://localhost:5000/api/...)
    ↓
Response → cập nhật state → React re-render UI
```

---

## 🌐 Context Providers (Thứ tự bọc trong App.tsx)

```
AuthContext          ← Ngoài cùng (các context khác cần auth)
  └── PlayerContext  ← Quản lý player toàn cục
        └── FavoriteContext  ← Cần biết userId để load favorites
              └── NotificationContext  ← SignalR kết nối sau khi auth
                    └── Router + Routes
```