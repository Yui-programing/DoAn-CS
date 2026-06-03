// Đường dẫn: TuneVault.Application.Repositories/IUserRepository.cs
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IUserRepository
    {
        // 1. Dành cho Authentication (Đăng nhập / Đăng ký)
        Task<User?> GetByEmailAsync(string email);
        Task<bool> CreateUserWithProfileAsync(User user, string fullName);

        // 2. Dành cho Profile (Lấy thông tin và Cập nhật)
        Task<UserProfile?> GetProfileByUserIdAsync(string userId); 
        Task<bool> UpdateProfileAsync(UserProfile profile); 
    }
}