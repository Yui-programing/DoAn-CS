using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IUserRepository
    {
        // Kiểm tra xem email đã tồn tại dưới DB chưa
        Task<User?> GetByEmailAsync(string email);

        // Tạo đồng thời cả tài khoản User và thông tin UserProfile (Dùng Transaction)
        Task<bool> CreateUserWithProfileAsync(User user, string fullName);
    }
}