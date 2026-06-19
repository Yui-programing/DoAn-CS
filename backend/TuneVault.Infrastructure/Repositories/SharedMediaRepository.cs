using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Application.Models;

namespace TuneVault.Infrastructure.Repositories
{

    public class SharedMediaRepository : ISharedRepository
    {
        private readonly IDbConnection _dbConnection;

        // T?ng Infrastructure tr?c ti?p qu?n lý Connection d? truy v?n SQL b?ng Dapper
        public SharedMediaRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<bool> UserExistsAsync(Guid userId)
        {
            string sql = "SELECT COUNT(1) FROM [User] WHERE Id = @UserId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
            return count > 0;
        }

        public async Task<bool> MediaItemExistsAsync(Guid mediaItemId)
        {
            string sql = "SELECT COUNT(1) FROM MediaItem WHERE Id = @MediaItemId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { MediaItemId = mediaItemId });
            return count > 0;
        }
        public async Task<bool> PlaylistExistsAsync(Guid playlistId)
        {
            string sql = "SELECT COUNT(1) FROM Playlist WHERE Id = @PlaylistId";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId });
            return count > 0;
        }

        public async Task<Guid> ShareMediaItemAsync(Guid senderId, Guid receiverId, Guid mediaItemId, string? message)
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
                PlaylistId = (Guid?)null,
                Message = message,
                SharedAt = DateTime.UtcNow
            });

            return shareId;
        }
        public async Task<Guid> SharePlaylistAsync(Guid senderId, Guid receiverId, Guid playlistId, string? message)
        {
            throw new NotImplementedException("Ch?c nang share playlist chua du?c hi?n th?c.");

        }

        public async Task<IEnumerable<SharedMediaItemDto>> GetSharedMediaItemsByReceiverIdAsync(Guid receiverId)
        {
            string sql = @"
                SELECT MediaItemId, SenderId, ReceiverId, SharedAt, Message
                FROM MediaShare
                WHERE ReceiverId = @ReceiverId AND MediaItemId IS NOT NULL";
            return await _dbConnection.QueryAsync<SharedMediaItemDto>(sql, new { ReceiverId = receiverId });
        }
}
}

