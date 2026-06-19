// Đường dẫn: TuneVault.Application.Repositories/IUserRepository.cs
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IUserRepository
    {
        // 1. Dành cho Authentication (Đăng nhập / Đăng ký)
        Task<User?> GetByEmailAsync(string email);
        Task<bool> CreateUserWithProfileAsync(User user, string fullName);
        Task<bool> UpdatePasswordAsync(Guid userId, string passwordHash);

        // 2. Dành cho Profile (Lấy thông tin và Cập nhật)
        Task<UserProfile?> GetProfileByUserIdAsync(Guid userId);
        Task<bool> UpdateProfileAsync(UserProfile profile);
        Task<User?> GetUserWithProfileByIdAsync(Guid userId);

        // 3. Dành cho Admin
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<bool> UpdateUserRoleAsync(Guid userId, string role);
        Task<bool> SetUserActiveStateAsync(Guid userId, bool isActive);
    }
}
