using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpRepository _otpRepository;

        public ResetPasswordCommandHandler(IUserRepository userRepository, IOtpRepository otpRepository)
        {
            _userRepository = userRepository;
            _otpRepository = otpRepository;
        }

        public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new FluentValidation.ValidationException("Không tìm thấy tài khoản với email này.");
            }

            // 2. Xác minh OTP
            var otp = await _otpRepository.GetLatestUnusedOtpAsync(request.Email, "ResetPassword");
            if (otp == null || otp.OtpCode != request.OtpCode)
            {
                throw new FluentValidation.ValidationException("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            // 3. Đổi mật khẩu
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            var result = await _userRepository.UpdatePasswordAsync(user.Id, passwordHash);

            // 4. Đánh dấu OTP đã dùng
            if (result)
            {
                await _otpRepository.MarkAsUsedAsync(otp.Id);
            }

            return result;
        }
    }
}
