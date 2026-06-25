# 📋 API Contract — TuneVault Backend

Tất cả các API đều trả về JSON theo cấu trúc chuẩn sau, dù thành công hay thất bại:

## Cấu trúc Phản hồi Chuẩn (Standard Response)

```json
{
  "success": true,
  "data": { },
  "message": "Thao tác thành công!",
  "errors": null
}
```

> Nếu `success = false`, trường `errors` sẽ là mảng chuỗi: `["Email không hợp lệ", "Mật khẩu quá ngắn"]`

---

## 🔑 Xác thực (Auth) — `/api/auth`

| HTTP | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register/send-otp` | `{ email }` | Gửi OTP đăng ký về email |
| POST | `/api/auth/register` | `{ name, email, password, otp }` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | `{ email, password }` | Đăng nhập — trả về JWT trong HttpOnly Cookie |
| POST | `/api/auth/logout` | — | Đăng xuất — xóa cookie |
| POST | `/api/auth/forgot-password/send-otp` | `{ email }` | Gửi OTP đặt lại mật khẩu |
| POST | `/api/auth/reset-password` | `{ email, otp, newPassword }` | Đặt lại mật khẩu |

---

## 👤 Người dùng (Users) — `/api/users`

| HTTP | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/users/profile` | Xem hồ sơ của chính mình |
| PUT | `/api/users/profile` | Cập nhật hồ sơ (tên, bio, avatar) |
| GET | `/api/users/{id}/profile` | Xem hồ sơ của người dùng khác |
| POST | `/api/users/register-artist` | Đăng ký trở thành Artist |

---

## 🎵 Media — `/api/media`

| HTTP | Endpoint | Body / Params | Mô tả |
|---|---|---|---|
| POST | `/api/media/upload` | FormData: `file, title, mediaType, thumbnailFile` | Upload bài hát hoặc video |
| GET | `/api/media/{id}` | Route: `id` | Xem chi tiết 1 media |
| GET | `/api/media/{id}/stream` | Header: `Range` | Stream nhạc/video (hỗ trợ Range request) |
| POST | `/api/media/{id}/thumbnail` | FormData: `file` | Upload thumbnail cho media |

---

## 📋 Playlist — `/api/playlists`

| HTTP | Endpoint | Body / Params | Mô tả |
|---|---|---|---|
| GET | `/api/playlists` | — | Lấy danh sách playlist của mình |
| POST | `/api/playlists` | `{ title, description, isPublic }` | Tạo playlist mới |
| PUT | `/api/playlists/{id}` | `{ title, description, isPublic }` | Cập nhật playlist |
| DELETE | `/api/playlists/{id}` | Route: `id` | Xóa playlist |
| GET | `/api/playlists/{id}` | Route: `id` | Xem chi tiết 1 playlist |
| GET | `/api/playlists/{id}/tracks` | Route: `id` | Lấy danh sách bài hát trong playlist |
| POST | `/api/playlists/{id}/tracks` | `{ mediaItemId }` | Thêm bài hát vào playlist |
| DELETE | `/api/playlists/{id}/tracks/{trackId}` | Route: `id, trackId` | Xóa bài hát khỏi playlist |
| GET | `/api/playlists/user/{userId}` | Route: `userId` | Lấy danh sách playlist công khai của người dùng khác |

---

## 🔍 Tìm kiếm (Search) — `/api/search`

| HTTP | Endpoint | Query | Mô tả |
|---|---|---|---|
| GET | `/api/search` | `?q=keyword` | Tìm kiếm bài hát, nghệ sĩ, album |

---

## ❤️ Yêu thích (Favorites) — `/api/favorites`

| HTTP | Endpoint | Body / Params | Mô tả |
|---|---|---|---|
| GET | `/api/favorites` | — | Lấy danh sách bài hát đã thả tim |
| POST | `/api/favorites` | `{ mediaItemId }` | Thả tim bài hát |
| DELETE | `/api/favorites/{mediaId}` | Route: `mediaId` | Bỏ thả tim |

---

## 👥 Theo dõi (Follows) — `/api/follows`

| HTTP | Endpoint | Params | Mô tả |
|---|---|---|---|
| POST | `/api/follows/{artistId}` | Route: `artistId` | Follow nghệ sĩ |
| DELETE | `/api/follows/{artistId}` | Route: `artistId` | Unfollow nghệ sĩ |
| GET | `/api/follows/{artistId}/status` | Route: `artistId` | Kiểm tra trạng thái follow |
| GET | `/api/follows/following` | — | Danh sách nghệ sĩ đang follow |
| GET | `/api/follows/{artistId}/followers` | Route: `artistId` | Danh sách follower của nghệ sĩ |

---

## 📤 Chia sẻ (Share) — `/api/share`

| HTTP | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/api/share/media` | `{ receiverId, mediaItemId, message }` | Chia sẻ bài hát cho người dùng khác |
| POST | `/api/share/playlist` | `{ receiverId, playlistId, message }` | Chia sẻ playlist |
| POST | `/api/share/album` | `{ receiverId, albumId, message }` | Chia sẻ album |

---

## 📥 Inbox — `/api/inbox`

| HTTP | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/inbox` | Lấy danh sách contacts (hộp thư đến) |
| GET | `/api/inbox/{userId}/history` | Xem lịch sử chat với 1 người |
| POST | `/api/inbox/accept/{senderId}` | Chấp nhận yêu cầu chia sẻ |

---

## 🔔 Thông báo (Notifications) — `/api/notifications`

| HTTP | Endpoint | Params | Mô tả |
|---|---|---|---|
| GET | `/api/notifications` | — | Lấy danh sách thông báo của mình |
| PUT | `/api/notifications/{id}/read` | Route: `id` | Đánh dấu 1 thông báo đã đọc |
| PUT | `/api/notifications/read-all` | — | Đánh dấu tất cả đã đọc |

---

## 📜 Lịch sử (History) — `/api/history`

| HTTP | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/api/history` | `{ mediaItemId }` | Ghi nhận 1 lượt nghe mới |
| GET | `/api/history` | — | Lấy 10 bài nghe gần nhất |

---

## 🎤 Nghệ sĩ (Artists) — `/api/artists`

| HTTP | Endpoint | Params | Mô tả |
|---|---|---|---|
| GET | `/api/artists/{id}` | Route: `id` | Xem thông tin nghệ sĩ |
| GET | `/api/artists/{id}/media` | Route: `id` | Lấy danh sách nhạc của nghệ sĩ |

---

## 💿 Album — `/api/albums`

| HTTP | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/albums/{id}` | Xem chi tiết album |
| POST | `/api/albums` | Tạo album mới (Artist only) |

---

## 🛡️ Admin — `/api/admin`

| HTTP | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/users` | Lấy toàn bộ danh sách users |
| PUT | `/api/admin/users/{id}/role` | Thay đổi role người dùng |
| PUT | `/api/admin/users/{id}/active` | Kích hoạt/Vô hiệu hóa tài khoản |

---

> **Xác thực**: Tất cả các endpoint (trừ Auth) đều yêu cầu JWT Token được gửi qua **HttpOnly Cookie** tên `token`. Cookie được thiết lập tự động sau khi đăng nhập thành công.
