using MediatR;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public RegisterCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
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

            // 2. Mã hóa mật khẩu
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Tạo cấu trúc Entity
            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // 4. Lưu xuống database ( request.Name truyền vào làm FullName )
            return await _userRepository.CreateUserWithProfileAsync(newUser, request.Name);
        }
    }
}