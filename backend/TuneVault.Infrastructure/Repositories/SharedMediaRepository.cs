using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Application.Models;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class SharedMediaRepository : ISharedRepository
    {
        private readonly IDbConnection _dbConnection;

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

        public async Task<bool> AlbumExistsAsync(Guid id)
        {
            string sql = "SELECT COUNT(1) FROM Album WHERE Id = @Id";
            var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { Id = id });
            return count > 0;
        }

        public async Task<Guid> ShareMediaItemAsync(Guid senderId, Guid receiverId, Guid mediaItemId, string? message, bool isAccepted)
        {
            var shareId = Guid.NewGuid();
            string sql = @"
                INSERT INTO MediaShare (Id, SenderId, ReceiverId, MediaItemId, Message, SharedAt, IsAccepted)
                VALUES (@Id, @SenderId, @ReceiverId, @MediaItemId, @Message, @SharedAt, @IsAccepted)";

            await _dbConnection.ExecuteAsync(sql, new
            {
                Id = shareId,
                SenderId = senderId,
                ReceiverId = receiverId,
                MediaItemId = mediaItemId,
                Message = message,
                SharedAt = DateTime.UtcNow,
                IsAccepted = isAccepted
            });

            return shareId;
        }

        public async Task<Guid> SharePlaylistAsync(Guid senderId, Guid receiverId, Guid playlistId, string? message, bool isAccepted)
        {
            var shareId = Guid.NewGuid();
            string sql = @"
                INSERT INTO MediaShare (Id, SenderId, ReceiverId, PlaylistId, Message, SharedAt, IsAccepted)
                VALUES (@Id, @SenderId, @ReceiverId, @PlaylistId, @Message, @SharedAt, @IsAccepted)";

            await _dbConnection.ExecuteAsync(sql, new
            {
                Id = shareId,
                SenderId = senderId,
                ReceiverId = receiverId,
                PlaylistId = playlistId,
                Message = message,
                SharedAt = DateTime.UtcNow,
                IsAccepted = isAccepted
            });

            return shareId;
        }

        public async Task<Guid> ShareAlbumAsync(Guid senderId, Guid receiverId, Guid albumId, string? message, bool isAccepted)
        {
            var shareId = Guid.NewGuid();
            string sql = @"
                INSERT INTO MediaShare (Id, SenderId, ReceiverId, AlbumId, Message, SharedAt, IsAccepted)
                VALUES (@Id, @SenderId, @ReceiverId, @AlbumId, @Message, @SharedAt, @IsAccepted)";

            await _dbConnection.ExecuteAsync(sql, new
            {
                Id = shareId,
                SenderId = senderId,
                ReceiverId = receiverId,
                AlbumId = albumId,
                Message = message,
                SharedAt = DateTime.UtcNow,
                IsAccepted = isAccepted
            });

            return shareId;
        }

        public async Task<IEnumerable<SharedMediaItemDto>> GetSharedMediaItemsByReceiverIdAsync(Guid receiverId)
        {
            string sql = @"
                SELECT MediaItemId, SenderId, ReceiverId, SharedAt, Message
                FROM MediaShare
                WHERE ReceiverId = @ReceiverId AND MediaItemId IS NOT NULL";
            return await _dbConnection.QueryAsync<SharedMediaItemDto>(sql, new { ReceiverId = receiverId });
        }

        public async Task<IEnumerable<MediaShare>> GetInboxAsync(Guid receiverId)
        {
            
            string sql = @"
                SELECT *
                FROM MediaShare
                WHERE (ReceiverId = @UserId AND IsAccepted = 1)
                   OR (SenderId = @UserId)
                ORDER BY SharedAt DESC";
            return await _dbConnection.QueryAsync<MediaShare>(sql, new { UserId = receiverId });
        }

        public async Task<IEnumerable<MediaShare>> GetMessageRequestsAsync(Guid receiverId)
        {
            
            string sql = @"
                SELECT *
                FROM MediaShare
                WHERE ReceiverId = @UserId AND IsAccepted = 0
                ORDER BY SharedAt DESC";
            return await _dbConnection.QueryAsync<MediaShare>(sql, new { UserId = receiverId });
        }

        public async Task<IEnumerable<MediaShare>> GetChatHistoryAsync(Guid userId1, Guid userId2)
        {
            string sql = @"
                SELECT *
                FROM MediaShare
                WHERE (SenderId = @U1 AND ReceiverId = @U2)
                   OR (SenderId = @U2 AND ReceiverId = @U1)
                ORDER BY SharedAt ASC";
            return await _dbConnection.QueryAsync<MediaShare>(sql, new { U1 = userId1, U2 = userId2 });
        }

        public async Task<bool> AcceptMessageRequestAsync(Guid receiverId, Guid senderId)
        {
            string sql = @"
                UPDATE MediaShare
                SET IsAccepted = 1
                WHERE ReceiverId = @ReceiverId AND SenderId = @SenderId AND IsAccepted = 0";
            var affectedRows = await _dbConnection.ExecuteAsync(sql, new { ReceiverId = receiverId, SenderId = senderId });
            return affectedRows > 0;
        }
    }
}
