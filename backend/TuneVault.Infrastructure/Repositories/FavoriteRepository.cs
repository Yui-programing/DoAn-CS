using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly string _connectionString;

        public FavoriteRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Guid> AddAsync(Favorite favorite)
        {
            const string sql = @"
                INSERT INTO Favorite (Id, UserId, MediaItemId, AddedAt)
                VALUES (@Id, @UserId, @MediaItemId, @AddedAt)";

            using IDbConnection db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(sql, favorite);
            return favorite.Id;
        }

        public async Task DeleteAsync(string userId, Guid mediaItemId)
        {
            const string sql = @"
                DELETE FROM Favorite 
                WHERE UserId = @UserId AND MediaItemId = @MediaItemId";

            using IDbConnection db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(sql, new { UserId = userId, MediaItemId = mediaItemId });
        }

        public async Task<bool> ExistsAsync(string userId, Guid mediaItemId)
        {
            const string sql = @"
                SELECT COUNT(1) 
                FROM Favorite 
                WHERE UserId = @UserId AND MediaItemId = @MediaItemId";

            using IDbConnection db = new SqlConnection(_connectionString);
            var count = await db.ExecuteScalarAsync<int>(sql, new { UserId = userId, MediaItemId = mediaItemId });
            return count > 0;
        }

        public async Task<IEnumerable<FavoriteDto>> GetByUserIdAsync(string userId)
        {
            const string sql = @"
                SELECT 
                    f.Id, 
                    f.UserId, 
                    f.MediaItemId, 
                    f.AddedAt AS CreatedAt, 
                    m.Title AS MediaTitle, 
                    m.CoverUrl, 
                    m.ArtistName, 
                    m.DurationInSeconds,
                    m.MediaType 
                FROM Favorite f
                INNER JOIN MediaItem m ON f.MediaItemId = m.Id
                WHERE f.UserId = @UserId
                ORDER BY f.AddedAt DESC";

            using IDbConnection db = new SqlConnection(_connectionString);
            return await db.QueryAsync<FavoriteDto>(sql, new { UserId = userId });
        }
    }
}
