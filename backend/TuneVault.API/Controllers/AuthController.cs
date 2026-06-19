using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Application.Features.Auth.Commands.Login;
using TuneVault.Application.Features.Auth.Commands.Register;
using TuneVault.Application.Features.Auth.Commands.SendRegistrationOtp;
using TuneVault.Application.Features.Auth.Commands.SendForgotPasswordOtp;
using TuneVault.Application.Features.Auth.Commands.ResetPassword;
using TuneVault.Application.Repositories;
using TuneVault.API.Common;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Route chuẩn: /api/auth
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUserRepository _userRepository;

        public AuthController(IMediator mediator, IUserRepository userRepository)
        {
            _mediator = mediator;
            _userRepository = userRepository;
        }

        [HttpPost("register/send-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendRegistrationOtp([FromBody] SendRegistrationOtpCommand command)
        {
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.SetSuccess(null!, "Mã OTP đã được gửi đến email của bạn!"));
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
                Secure = Request.IsHttps, // Tự động bật Secure khi dùng HTTPS, tắt khi dùng HTTP ở local
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
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(-1) // Hết hạn từ ngày hôm qua
            };

            // Xóa cookie "token" bằng cách gửi cookie hết hạn
            Response.Cookies.Delete("token", cookieOptions);

            return Ok(ApiResponse<object>.SetSuccess(null!, "Đăng xuất thành công!"));
        }

        [HttpPost("forgot-password/send-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendForgotPasswordOtp([FromBody] SendForgotPasswordOtpCommand command)
        {
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.SetSuccess(null!, "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!"));
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return BadRequest(ApiResponse<object>.SetFailure(
                    new List<string> { "Hệ thống không thể đổi mật khẩu lúc này." },
                    "Đổi mật khẩu thất bại!"
                ));
            }
            return Ok(ApiResponse<object>.SetSuccess(null!, "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ."));
        }
    }
}
