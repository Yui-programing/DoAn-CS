using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.SendRegistrationOtp
{
    public class SendRegistrationOtpCommandHandler : IRequestHandler<SendRegistrationOtpCommand, bool>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;

        public SendRegistrationOtpCommandHandler(IUserRepository userRepository, IOtpRepository otpRepository, IEmailService emailService)
        {
            _userRepository = userRepository;
            _otpRepository = otpRepository;
            _emailService = emailService;
        }

        public async Task<bool> Handle(SendRegistrationOtpCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra email trùng
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new FluentValidation.ValidationException("Email này đã được sử dụng trong hệ thống.");
            }

            // 2. Tạo mã OTP (6 chữ số ngẫu nhiên)
            var otpCode = new Random().Next(100000, 999999).ToString();

            // 3. Lưu OTP vào DB
            var otp = new OtpVerification
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                OtpCode = otpCode,
                Purpose = "Register",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5), // Hết hạn sau 5 phút
                IsUsed = false
            };

            await _otpRepository.AddAsync(otp);

            // 4. Gửi email
            string subject = "Mã xác nhận đăng ký tài khoản TuneVault";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #1db954;'>Xác nhận địa chỉ email của bạn</h2>
                    <p>Chào bạn,</p>
                    <p>Bạn đã yêu cầu đăng ký tài khoản tại TuneVault. Dưới đây là mã OTP của bạn (có hiệu lực trong 5 phút):</p>
                    <div style='background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                        <h1 style='color: #333; letter-spacing: 5px; margin: 0;'>{otpCode}</h1>
                    </div>
                    <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ TuneVault</p>
                </div>";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            return true;
        }
    }
}
