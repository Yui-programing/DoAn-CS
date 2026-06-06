using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TuneVault.Application.Features.Auth.Commands.Login;
using TuneVault.Application.Features.Auth.Commands.Register;
using TuneVault.Application.Models;
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
                return BadRequest(ApiResponseDto<object>.Fail(
                    new List<string> { "Hệ thống không thể khởi tạo dữ liệu người dùng lúc này." },
                    "Đăng ký thất bại!"
                ));
            }

            // 3. Trả về kết quả thành công đúng chuẩn Hợp đồng JSON (success: true, data: null)
            return Ok(ApiResponseDto<object>.Ok(null!, "Đăng ký tài khoản thành công!"));
        }


        [HttpPost("login")] // Endpoint chuẩn: POST /api/auth/login
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            // Bắn lệnh vào MediatR để xử lý logic băm mật khẩu và tạo token ngầm
            var token = await _mediator.Send(command);

            // Dùng khuôn ApiResponseDto bọc cục token bóng bẩy trả về Frontend
            return Ok(ApiResponseDto<string>.Ok(token, "Đăng nhập thành công!"));
        }
    }
}