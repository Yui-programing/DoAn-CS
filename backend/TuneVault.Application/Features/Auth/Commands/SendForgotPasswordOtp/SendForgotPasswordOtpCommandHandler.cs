using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.SendForgotPasswordOtp
{
    public class SendForgotPasswordOtpCommandHandler : IRequestHandler<SendForgotPasswordOtpCommand, bool>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;

        public SendForgotPasswordOtpCommandHandler(IUserRepository userRepository, IOtpRepository otpRepository, IEmailService emailService)
        {
            _userRepository = userRepository;
            _otpRepository = otpRepository;
            _emailService = emailService;
        }

        public async Task<bool> Handle(SendForgotPasswordOtpCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra email có tồn tại không
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser == null)
            {
                throw new FluentValidation.ValidationException("Không tìm thấy tài khoản với email này.");
            }

            // 2. Tạo mã OTP
            var otpCode = new Random().Next(100000, 999999).ToString();

            // 3. Lưu OTP vào DB
            var otp = new OtpVerification
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                OtpCode = otpCode,
                Purpose = "ResetPassword",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5), // Hết hạn sau 5 phút
                IsUsed = false
            };

            await _otpRepository.AddAsync(otp);

            // 4. Gửi email
            string subject = "Mã xác nhận quên mật khẩu TuneVault";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #1db954;'>Yêu cầu đặt lại mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TuneVault của bạn. Dưới đây là mã OTP của bạn (có hiệu lực trong 5 phút):</p>
                    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                        <h1 style='color: #333; letter-spacing: 5px; margin: 0;'>{otpCode}</h1>
                    </div>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ TuneVault</p>
                </div>";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            return true;
        }
    }
}
