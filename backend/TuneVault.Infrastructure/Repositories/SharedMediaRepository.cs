using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Infrastructure.Repositories
{

    public class SharedMediaRepository : ISharedRepository
    {
        private readonly IDbConnection _dbConnection;

        // Tầng Infrastructure trực tiếp quản lý Connection để truy vấn SQL bằng Dapper
        public SharedMediaRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<bool> UserExistsAsync(string userId)
        {
            string sql = "SELECT COUNT(1) FROM User WHERE Id = @UserId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
            return count > 0;
        }

        public async Task<bool> MediaItemExistsAsync(Guid mediaItemId)
        {
            string sql = "SELECT COUNT(1) FROM MediaItems WHERE Id = @MediaItemId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { MediaItemId = mediaItemId });
            return count > 0;
        }
        public async Task<bool> PlaylistExistsAsync(Guid playlistId)
        {
            string sql = "SELECT COUNT(1) FROM Playlists WHERE Id = @PlaylistId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId });
            return count > 0;
        }

        public async Task<Guid> ShareItemAsync(string senderId, string receiverId, Guid? id, Guid? mediaItemId, string? message)
        {
            var shareId = Guid.NewGuid();
            string sql = @"
                INSERT INTO MediaShare (Id, SenderId, ReceiverId, MediaItemId, PlaylistId, Message, SharedAt)
                VALUES (@Id, @SenderId, @ReceiverId, @MediaItemId, @PlaylistId, @Message, @SharedAt)";

            await _dbConnection.ExecuteAsync(sql, new
            {
                Id = shareId,
                SenderId = senderId,
                ReceiverId = receiverId,
                MediaItemId = mediaItemId,
                PlaylistId = id,
                Message = message,
                SharedAt = DateTime.UtcNow
            });

            return shareId;
        }
        
    }
}
