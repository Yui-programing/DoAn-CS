using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Repositories;
using System.Security.Claims;
using TuneVault.Application.Features.Users.Profile;
using TuneVault.API.Common;
using TuneVault.API.Requests;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICloudinaryService _cloudinaryService;

        public UsersController(IMediator mediator, ICloudinaryService cloudinaryService)
        {
            _mediator = mediator;
            _cloudinaryService = cloudinaryService;
        }

        // 1. GET / Xem hồ sơ User
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("User ID không hợp lệ");

            // Tạo query và gửi cho MediatR xử lý
            var query = new GetProfileQuery { UserId = userId };
            var data = await _mediator.Send(query);
            return Ok(ApiResponse<UserProfileDto>.SetSuccess(data, "Lấy thông tin thành công!"));
        }

        // GET / Xem hồ sơ người khác
        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetProfileById(Guid id)
        {
            var query = new GetProfileQuery { UserId = id };
            var data = await _mediator.Send(query);
            var callerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(callerIdStr, out var callerId);

            if (data.Id != callerId && !data.IsPublic)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem hồ sơ riêng tư này.");
            }
            
            return Ok(ApiResponse<UserProfileDto>.SetSuccess(data, "Lấy thông tin thành công!"));
        }

        // 2. PUT / Cập nhật hồ sơ người dùng
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto request)
        {
            var userIdFromTokenStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromTokenStr) || !Guid.TryParse(userIdFromTokenStr, out var userIdFromToken))
            {
                var errors = new List<string> { "Token không hợp lệ hoặc đã hết hạn." };
                return Unauthorized(ApiResponse<bool>.SetFailure(errors, "Xác thực thất bại!"));
            }

            // 2. Map dữ liệu từ UserProfileDto và Token vào Command để đẩy qua MediatR
            var command = new UpdateProfileCommand
            {
                UserId = userIdFromToken, // Lấy từ Token bảo mật
                FullName = request.FullName, // Lấy từ Body thông qua DTO có sẵn
                Bio = request.Bio,           // Lấy từ Body thông qua DTO có sẵn
                AvatarUrl = request.AvatarUrl, // Lấy từ Body thông qua DTO có sẵn
                IsPublic = request.IsPublic
            };

            // 3. Đẩy sang Handler xử lý xuống Database
            var result = await _mediator.Send(command);

            // 4. Giữ nguyên hàm Response chuẩn của bạn
            return Ok(ApiResponse<bool>.SetSuccess(result, "Cập nhật thông tin thành công!"));
        }

        // POST: /api/users/artist-registration
        [HttpPost("artist-registration")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitArtistRegistration([FromForm] SubmitArtistRegistrationRequest request)
        {
            var userIdStr2 = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr2) || !Guid.TryParse(userIdStr2, out var userId)) 
                return Unauthorized(ApiResponse<bool>.SetFailure(new System.Collections.Generic.List<string> { "Token không hợp lệ." }, "Xác thực thất bại"));

            if (request.IdCard == null || request.IdCard.Length == 0) return BadRequest(ApiResponse<bool>.SetFailure(new System.Collections.Generic.List<string> { "Vui lòng tải lên ảnh CMND/CCCD." }, "Thiếu file"));

            // Upload idCard to Cloudinary
            string url;
            using (var stream = request.IdCard.OpenReadStream())
            {
                url = await _cloudinaryService.UploadImageAsync(stream, request.IdCard.FileName, "TuneVault/artist-registrations");
            }

            var cmd = new TuneVault.Application.Features.Artists.Commands.SubmitArtistRegistrationCommand
            {
                UserId = userId,
                StageName = request.StageName,
                Genres = request.Genres,
                IdCardUrl = url
            };

            var id = await _mediator.Send(cmd);
            return Ok(ApiResponse<Guid>.SetSuccess(id, "Gửi yêu cầu đăng ký artist thành công."));
        }

        // POST: /api/users/avatar
        [HttpPost("avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(ApiResponse<bool>.SetFailure(new System.Collections.Generic.List<string> { "Vui lòng tải lên ảnh đại diện." }, "Thiếu file"));

            string url;
            using (var stream = file.OpenReadStream())
            {
                url = await _cloudinaryService.UploadImageAsync(stream, file.FileName, "TuneVault/Avatars");
            }

            return Ok(ApiResponse<string>.SetSuccess(url, "Tải ảnh lên thành công."));
        }
    }
}

