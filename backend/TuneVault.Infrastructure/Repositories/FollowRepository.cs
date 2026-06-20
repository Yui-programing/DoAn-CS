using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class FollowRepository : IFollowRepository
    {
        private readonly IDbConnection _dbConnection;

        public FollowRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<bool> FollowAsync(Guid followerId, Guid followingUserId)
        {
            const string sql = @"
                IF NOT EXISTS (SELECT 1 FROM Follow WHERE FollowerId = @FollowerId AND FollowingUserId = @FollowingUserId)
                BEGIN
                    INSERT INTO Follow (Id, FollowerId, FollowingUserId, FollowedAt)
                    VALUES (NEWID(), @FollowerId, @FollowingUserId, GETUTCDATE());
                    SELECT 1;
                END
                ELSE
                BEGIN
                    SELECT 0;
                END";

            var result = await _dbConnection.ExecuteScalarAsync<int>(sql, new { FollowerId = followerId, FollowingUserId = followingUserId });
            return result > 0;
        }

        public async Task<bool> UnfollowAsync(Guid followerId, Guid followingUserId)
        {
            const string sql = @"
                DELETE FROM Follow 
                WHERE FollowerId = @FollowerId AND FollowingUserId = @FollowingUserId";

            var rowsAffected = await _dbConnection.ExecuteAsync(sql, new { FollowerId = followerId, FollowingUserId = followingUserId });
            return rowsAffected > 0;
        }

        public async Task<bool> IsFollowingAsync(Guid followerId, Guid followingUserId)
        {
            const string sql = @"
                SELECT COUNT(1) 
                FROM Follow 
                WHERE FollowerId = @FollowerId AND FollowingUserId = @FollowingUserId";

            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { FollowerId = followerId, FollowingUserId = followingUserId });
            return count > 0;
        }

        public async Task<int> GetFollowerCountAsync(Guid userId)
        {
            const string sql = "SELECT COUNT(1) FROM Follow WHERE FollowingUserId = @UserId";
            return await _dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
        }

        public async Task<int> GetFollowingCountAsync(Guid userId)
        {
            const string sql = "SELECT COUNT(1) FROM Follow WHERE FollowerId = @UserId";
            return await _dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<UserProfile>> GetFollowingArtistsAsync(Guid userId)
        {
            const string sql = @"
                SELECT p.Id, p.FullName, p.AvatarUrl, p.Bio, p.IsPublic
                FROM Follow f
                INNER JOIN UserProfile p ON f.FollowingUserId = p.Id
                INNER JOIN [User] u ON p.Id = u.Id
                WHERE f.FollowerId = @UserId AND u.Role = 'Artist'
                ORDER BY f.FollowedAt DESC";

            return await _dbConnection.QueryAsync<UserProfile>(sql, new { UserId = userId });
        }
    }
}
