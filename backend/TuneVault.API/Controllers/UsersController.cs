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
    // [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        
        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // 1. GET / Xem hồ sơ User
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile([FromQuery] string? userId = null)
        {
            string userIdParsed;
            
            // TODO: Xóa code tạm thời này khi đã có JWT token
            if (!string.IsNullOrEmpty(userId))
            {
                userIdParsed = userId;
            }
            else
            {
                // Lấy Id của người dùng đang đăng nhập từ trong JWT token
                // var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                // if (string.IsNullOrEmpty(userIdStr))
                //     return Unauthorized("User ID không hợp lệ");
                
                // Gán trực tiếp vì cả 2 đều là string, không cần Guid.Parse(userIdStr) nữa
                // userIdParsed = userIdStr; 
                
                return BadRequest("Vui lòng truyền userId trong query parameter (tạm thời)");
            }

            // Tạo query và gửi cho MediatR xử lý
            var query = new GetProfileQuery { UserId = userIdParsed };
            var data = await _mediator.Send(query);
            return Ok(ApiResponseDto<UserProfileDto>.Ok(data, "Lấy thông tin thành công!"));
        }

        // 2. PUT / Cập nhật hồ sơ người dùng
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
        {
            // TODO: Xóa code tạm thời này khi đã có JWT token
            if (string.IsNullOrEmpty(command.UserId)) 
                return BadRequest("Vui lòng truyền UserId trong body (tạm thời)");

            // var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // if (string.IsNullOrEmpty(userIdStr))
            //     return Unauthorized("User ID không hợp lệ");
            
            // Gán trực tiếp, không cần Guid.Parse
            // command.UserId = userIdStr; 
            
            await _mediator.Send(command);
            return Ok(ApiResponseDto<bool>.Ok(true, "Cập nhật thông tin thành công!"));
        }
    }
}