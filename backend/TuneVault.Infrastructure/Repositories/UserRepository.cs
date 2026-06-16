using System.Data;
using Dapper;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnection _dbConnection;

        // Ép hệ thống DI bơm IDbConnection đã cấu hình ở file DependencyInjection vào đây
        public UserRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        // 1. Hàm kiểm tra xem email đã tồn tại dưới DB chưa
        public async Task<User?> GetByEmailAsync(string email)
        {
            const string sql = "SELECT * FROM [User] WHERE Email = @Email";
            return await _dbConnection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }
        //  Hàm kiểm tra xem id đã tồn tại dưới DB chưa
        public async Task<UserProfile?> GetProfileByUserIdAsync(string id)
        {
            const string sql = "SELECT * FROM [UserProfile] WHERE Id = @Id";
            return await _dbConnection.QueryFirstOrDefaultAsync<UserProfile>(sql, new { Id = id });
        }
        //Hàm cập nhật UserProfile
        public async Task<bool> UpdateProfileAsync(UserProfile profile)
        {
            // KHÔNG động tới bảng Users
            const string sql = @"
                UPDATE UserProfile 
                SET 
                    FullName = @FullName,
                    Bio = @Bio, 
                    AvatarUrl = @AvatarUrl
                WHERE Id = @Id"; // Khóa ngoại liên kết

            int rowsAffected = await _dbConnection.ExecuteAsync(sql, profile);
            return rowsAffected > 0;
        }




        public async Task<bool> UpdatePasswordAsync(string userId, string passwordHash)
        {
            const string sql = "UPDATE [User] SET PasswordHash = @PasswordHash WHERE Id = @Id";
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, new { PasswordHash = passwordHash, Id = userId });
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            const string sql = @"
                SELECT u.Id, u.Email, u.PasswordHash, u.[Role], u.CreatedAt, u.IsActive,
                       p.Id AS ProfileId, p.FullName, p.AvatarUrl, p.Bio
                FROM [User] u
                LEFT JOIN UserProfile p ON u.Id = p.Id";

            var userDictionary = new Dictionary<string, User>();

            await _dbConnection.QueryAsync<User, UserProfile, User>(
                sql,
                (user, profile) =>
                {
                    if (!userDictionary.TryGetValue(user.Id, out var existingUser))
                    {
                        existingUser = user;
                        existingUser.Profile = profile;
                        userDictionary.Add(existingUser.Id, existingUser);
                    }
                    return existingUser;
                },
                splitOn: "ProfileId"
            );

            return userDictionary.Values;
        }

        public async Task<User?> GetUserWithProfileByIdAsync(string userId)
        {
            const string sql = @"
                SELECT u.Id, u.Email, u.PasswordHash, u.[Role], u.CreatedAt, u.IsActive,
                       p.Id AS ProfileId, p.FullName, p.AvatarUrl, p.Bio
                FROM [User] u
                LEFT JOIN UserProfile p ON u.Id = p.Id
                WHERE u.Id = @Id";

            var userDictionary = new Dictionary<string, User>();

            var result = await _dbConnection.QueryAsync<User, UserProfile, User>(
                sql,
                (user, profile) =>
                {
                    if (!userDictionary.TryGetValue(user.Id, out var existingUser))
                    {
                        existingUser = user;
                        existingUser.Profile = profile;
                        userDictionary.Add(existingUser.Id, existingUser);
                    }
                    return existingUser;
                },
                new { Id = userId },
                splitOn: "ProfileId"
            );

            return userDictionary.Values.FirstOrDefault();
        }

        public async Task<bool> UpdateUserRoleAsync(string userId, string role)
        {
            const string sql = "UPDATE [User] SET [Role] = @Role WHERE Id = @Id";
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, new { Role = role, Id = userId });
            return rowsAffected > 0;
        }

        public async Task<bool> SetUserActiveStateAsync(string userId, bool isActive)
        {
            const string sql = "UPDATE [User] SET IsActive = @IsActive WHERE Id = @Id";
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, new { IsActive = isActive, Id = userId });
            return rowsAffected > 0;
        }

        // 2. Hàm chèn đồng thời cả User và UserProfile (Dùng Transaction bảo vệ)
        public async Task<bool> CreateUserWithProfileAsync(User user, string fullName)
        {
            if (_dbConnection.State == ConnectionState.Closed)
                _dbConnection.Open();

            using var transaction = _dbConnection.BeginTransaction();
            try
            {
                // Lệnh SQL chèn bảng [User]
                const string insertUserSql = @"
                    INSERT INTO [User] (Id, Email, PasswordHash, [Role], CreatedAt, IsActive)
                    VALUES (@Id, @Email, @PasswordHash, @Role, @CreatedAt, @IsActive);";

                int userRows = await _dbConnection.ExecuteAsync(insertUserSql, user, transaction);

                // Lệnh SQL chèn bảng UserProfile (Id lấy trùng với Id của User để tạo mối quan hệ 1-1)
                const string insertProfileSql = @"
                    INSERT INTO UserProfile (Id, FullName, AvatarUrl, Bio)
                    VALUES (@Id, @FullName, NULL, NULL);";

                int profileRows = await _dbConnection.ExecuteAsync(insertProfileSql, new
                {
                    Id = user.Id,
                    FullName = fullName
                }, transaction);

                // Nếu cả 2 bảng đều chèn thành công
                if (userRows > 0 && profileRows > 0)
                {
                    transaction.Commit(); // Lưu vĩnh viễn
                    return true;
                }

                transaction.Rollback();
                return false;
            }
            catch
            {
                transaction.Rollback(); // Có lỗi lập tức hủy bỏ toàn bộ luồng, tránh sinh tài khoản rác
                throw;
            }
        }
    }
}