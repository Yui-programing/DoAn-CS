using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using TuneVault.Application.Features.Auth.Commands.Login;
using TuneVault.Application.Features.Auth.Commands.Register;
using TuneVault.API.Common;
namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Route chuẩn: /api/auth
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")] // Endpoint chuẩn: POST /api/auth/register
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            // 1. Bắn lệnh vào đường ống. Nếu dữ liệu bậy, ValidationBehavior tự ném lỗi, 
            // Middleware tự hứng và trả về BadRequest 400 kèm mảng errors cho Frontend!
            var result = await _mediator.Send(command);

            // 2. Nếu không có lỗi nhập liệu nhưng DB gặp sự cố không lưu được
            if (!result)
            {
                return BadRequest(ApiResponse<object>.SetFailure(
                    new List<string> { "Hệ thống không thể khởi tạo dữ liệu người dùng lúc này." },
                    "Đăng ký thất bại!"
                ));
            }

            // 3. Trả về kết quả thành công đúng chuẩn Hợp đồng JSON (success: true, data: null)
            return Ok(ApiResponse<object>.SetSuccess(null!, "Đăng ký tài khoản thành công!"));
        }


        [HttpPost("login")] // Endpoint chuẩn: POST /api/auth/login
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            // Lấy token được sinh ra từ MediaR Handler
            var token = await _mediator.Send(command);
            // Thiết lập cấu hình bảo mật cho cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, //Ngăn chặn Js truy cập
                Secure = true, //Chỉ gửi qua HTTPS khi chạy Production
                SameSite = SameSiteMode.Strict, // Chống CSRF
                Expires = DateTimeOffset.UtcNow.AddDays(7)//Thời gian hết hạn của cookie là 7 ngày khớp với token
            };
            
            Response.Cookies.Append("token",token,cookieOptions);
            // Dùng khuôn ApiResponseDto bọc cục token bóng bẩy trả về Frontend
            return Ok(ApiResponse<string>.SetSuccess(token, "Đăng nhập thành công!"));
        }

        [Authorize] // Chỉ ai đang đăng nhập mới được gọi
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Thiết lập cookieOptions khớp với lúc tạo
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(-1) // Hết hạn từ ngày hôm qua
            };

            // Xóa cookie "token" bằng cách gửi cookie hết hạn
            Response.Cookies.Delete("token", cookieOptions);

            return Ok(ApiResponse<object>.SetSuccess(null!, "Đăng xuất thành công!"));
        }    
    }
}