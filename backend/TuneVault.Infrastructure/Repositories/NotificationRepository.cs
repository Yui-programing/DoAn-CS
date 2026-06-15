using System.Data;
using Dapper;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly IDbConnection _dbConnection;

        public NotificationRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId)
        {
            const string sql = "SELECT * FROM Notification WHERE UserId = @UserId ORDER BY CreatedAt DESC";
            return await _dbConnection.QueryAsync<Notification>(sql, new { UserId = userId });
        }

        public async Task<bool> CreateAsync(Notification notification)
        {
            const string sql = @"INSERT INTO Notification
                (Id, UserId, [Type], PayloadJson, IsRead, CreatedAt)
                VALUES
                (@Id, @UserId, @Type, @PayloadJson, @IsRead, @CreatedAt)";

            int rows = await _dbConnection.ExecuteAsync(sql, notification);
            return rows > 0;
        }

        public async Task<bool> MarkAsReadAsync(Guid id)
        {
            const string sql = "UPDATE Notification SET IsRead = 1 WHERE Id = @Id";
            int rows = await _dbConnection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<int> MarkAllAsReadAsync(string userId)
        {
            const string sql = "UPDATE Notification SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0";
            int rows = await _dbConnection.ExecuteAsync(sql, new { UserId = userId });
            return rows;
        }
    }
}
