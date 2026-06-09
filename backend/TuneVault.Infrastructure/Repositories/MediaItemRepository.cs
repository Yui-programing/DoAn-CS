using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class MediaItemRepository : IMediaItemRepository
{
    private readonly string _connectionString;

    public MediaItemRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<Guid> AddAsync(MediaItem mediaItem)
    {
        const string sql = @"
            INSERT INTO MediaItem (Id, Title, Description, FilePath, CoverUrl, DurationInSeconds, MediaType, OwnerId, AlbumId, ArtistId, IsPrivate, ViewCount)
            VALUES (@Id, @Title, @Description, @FilePath, @CoverUrl, @DurationInSeconds, @MediaType, @OwnerId, @AlbumId, @ArtistId, @IsPrivate, 0)";

        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, mediaItem);
        return mediaItem.Id;
    }

    public async Task<MediaItem?> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM MediaItem WHERE Id = @Id";
        using IDbConnection db = new SqlConnection(_connectionString);
        return await db.QueryFirstOrDefaultAsync<MediaItem>(sql, new { Id = id });
    }

    public async Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(string ownerId)
    {
        const string sql = "SELECT * FROM MediaItem WHERE OwnerId = @OwnerId";
        using IDbConnection db = new SqlConnection(_connectionString);
        return await db.QueryAsync<MediaItem>(sql, new { OwnerId = ownerId });
    }

    public async Task UpdateAsync(MediaItem mediaItem)
    {
        const string sql = @"
            UPDATE MediaItem
            SET Title = @Title, Description = @Description, CoverUrl = @CoverUrl, IsPrivate = @IsPrivate
            WHERE Id = @Id";
        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, mediaItem);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM MediaItem WHERE Id = @Id";
        using IDbConnection db = new SqlConnection(_connectionString);
        int rowsAffected = await db.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}
