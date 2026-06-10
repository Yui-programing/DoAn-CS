using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Infrastructure.Repositories
{

    public class SharedMediaRepository : ISharedMediaRepository
    {
        private readonly string _connectionString;

        public SharedMediaRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Guid> ShareItemAsync(Guid id, string senderId, string receiverId, Guid mediaItemId, string? message)
        {
            const string sql = @"
            INSERT INTO MediaShare (Id, SenderId, ReceiverId, MediaItemId, Message, SharedAt)
            VALUES (@Id, @SenderId, @ReceiverId, @MediaItemId, @Message, GETUTCDATE())";

            var parameters = new
            {
                Id = id,
                SenderId = senderId,
                ReceiverId = receiverId,
                MediaItemId = mediaItemId,
                Message = message
            };

            using IDbConnection db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(sql, parameters);

            return id;
        }
    }
}
