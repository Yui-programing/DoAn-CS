## 1. Cấu trúc JSON Phản hồi (Standard Response)
Tất cả các API trả về dù thành công hay thất bại đều phải bọc trong một object có định dạng sau:

```json
{
  "success": true,
  "data": { 
      // Dữ liệu trả về nằm ở đây (có thể là object User, mảng Playlist, hoặc null)
  },
  "message": "Thao tác thành công!", 
  "errors": null 
  // Nếu success = false, errors sẽ là mảng chứa các lỗi: ["Email không hợp lệ", "Mật khẩu quá ngắn"]
}

| Chức năng   | HTTP   | API Endpoint                          | Body / Query Params / Header          | Ý nghĩa |
|Xác thực     | POST   | `/api/auth/register`                  | Body: `Name`, `Email`, `Password`     | Đăng ký tài khoản |
|             | POST   | `/api/auth/login`                     | Body: `Email`, `Password`             | Đăng nhập lấy Token |
|Hồ sơ        | GET    | `/api/users/profile`                  | Header: `Authorization`               | Xem hồ sơ cá nhân |
|             | PUT    | `/api/users/profile`                  | Body: `Bio`, `AvatarUrl`              | Cập nhật hồ sơ | 
|Upload       | POST   | `/api/media/upload`                   | FormData: `File`, `Title`, `MediaType`| Tải bài hát/video lên |
|4 & 5. Stream| GET    | `/api/media/{id}`                     |  Route param: `id`                    | Xem chi tiết 1 Media |
|             | GET    | `/api/media/{id}/stream`              | Header: `Range` (Bắt buộc cho video)  | Phát nhạc/video |
|6. Playlist  | GET    | `/api/playlists`                      | Header: `Authorization`               | Lấy danh sách Playlist của mình |
|             | POST   | `/api/playlists`                      | Body: `Title`, `Description`          | Tạo Playlist mới |
|             | PUT    | `/api/playlists/{id}`                 | Body: `Title`, `Description`          | Sửa tên/mô tả Playlist |
|             | GET    | `/api/playlist'                       | Header: `Authorization`               | Lấy danh sách Playlist |
|             | DELETE | `/api/playlists/{id}`                 | Route param: `id`                     | Xóa Playlist |
|             | POST   | `/api/playlists/{id}/tracks`          | Body: `MediaItemId`                   | Thêm bài hát vào Playlist |
|             | GET    | `/api/playlists/{id}/tracks`          | Route params: `id`                    | Xem danh sách nhạc trong Playlist |
|             | DELETE | `/api/playlists/{id}/tracks/{trackId}`| Route params: `id`, `trackId`         | Bỏ bài hát khỏi Playlist |
|7. Tìm kiếm  | GET    | `/api/search`                         | Query: `?q=lofi&page=1`               | Tìm kiếm bài hát, ca sĩ |
|8. Chia sẻ   | POST   | `/api/share`                         | Body: `ReceiverId`, `MediaItemId`     | Gửi nhạc/video cho bạn bè |
|             | GET    | `/api/share`                         | Header: `Authorization`               | Xem hộp thư đến (nhạc được share) |
|9. Thông báo | GET    | `/api/notifications`                  | Header: `Authorization`               | Lấy danh sách thông báo |
|             | PUT    | `/api/notifications/{id}/read`        | Route param: `id`                     | Đánh dấu 1 thông báo đã đọc |
|10. Tương tác| POST   | `/api/favorites`                      | Body: `MediaItemId`                   | Thả tim bài hát |
|             | DELETE | `/api/favorites/{mediaId}`            | Route param: `mediaId`                | Bỏ thả tim |
|             | GET    | `/api/favorites`                      | Header: `Authorization`               | Xem danh sách bài hát yêu thích |
|             | POST   | `/api/history`                        | Body: `MediaItemId`                   | Ghi nhận 1 lượt nghe mới |
|             | GET    | `/api/history`                        | Header: `Authorization`               | Lấy 10 bài nghe gần nhất |
