using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Users.Profile;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{   
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        
        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // 1. GET / Xem hồ sơ User
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {

            // Lấy Id của người dùng đang đăng nhập từ trong JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized("User ID không hợp lệ");
 
            // Tạo query và gửi cho MediatR xử lý
            var query = new GetProfileQuery { UserId = userIdStr };
            var data = await _mediator.Send(query);
            return Ok(ApiResponseDto<UserProfileDto>.Ok(data, "Lấy thông tin thành công!"));
        }

        // 2. PUT / Cập nhật hồ sơ người dùng
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto request)
        {
            // 1. Lấy UserId trực tiếp từ Claims của Token (Bảo mật, tránh bị sửa bậy UserId)
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdFromToken))
            {

                var errors = new List<string> { "Token không hợp lệ hoặc đã hết hạn." };
                return Unauthorized(ApiResponseDto<bool>.Fail(errors, "Xác thực thất bại!")); //
            }

            // 2. Map dữ liệu từ UserProfileDto và Token vào Command để đẩy qua MediatR
            var command = new UpdateProfileCommand
            {
                UserId = userIdFromToken, // Lấy từ Token bảo mật
                FullName = request.FullName, // Lấy từ Body thông qua DTO có sẵn
                Bio = request.Bio,           // Lấy từ Body thông qua DTO có sẵn
                AvatarUrl = request.AvatarUrl // Lấy từ Body thông qua DTO có sẵn
            };

            // 3. Đẩy sang Handler xử lý xuống Database
            var result = await _mediator.Send(command);

            // 4. Giữ nguyên hàm Response chuẩn của bạn
            return Ok(ApiResponseDto<bool>.Ok(result, "Cập nhật thông tin thành công!"));
        }
    }
}