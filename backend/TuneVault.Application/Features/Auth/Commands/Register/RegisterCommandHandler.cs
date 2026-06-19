using MediatR;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, bool>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpRepository _otpRepository;

        public RegisterCommandHandler(IUserRepository userRepository, IOtpRepository otpRepository)
        {
            _userRepository = userRepository;
            _otpRepository = otpRepository;
        }

        public async Task<bool> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra email trùng
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                // Quăng lỗi để Validation phục vụ việc gom mảng lỗi ở API
                throw new FluentValidation.ValidationException("Email này đã được sử dụng trong hệ thống.");
            }

            // 2. Xác minh OTP
            var otp = await _otpRepository.GetLatestUnusedOtpAsync(request.Email, "Register");
            if (otp == null || otp.OtpCode != request.OtpCode)
            {
                throw new FluentValidation.ValidationException("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            // 3. Mã hóa mật khẩu
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Tạo cấu trúc Entity
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // 5. Lưu xuống database
            var result = await _userRepository.CreateUserWithProfileAsync(newUser, request.Name);
            
            // 6. Đánh dấu OTP đã sử dụng
            if (result)
            {
                await _otpRepository.MarkAsUsedAsync(otp.Id);
            }

            return result;
        }
    }
}
