using System;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlaylistRepository : IPlaylistRepository
{
    private readonly string _connectionString;

    public PlaylistRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    // 1. Create Logic
    public async Task<Guid> CreateAsync(Playlist playlist)
    {
        const string sql = @"
            INSERT INTO Playlists (Id, Title, Description, IsPublic, OwnerId, CreatedAt, IsDeleted)
            VALUES (@Id, @Title, @Description, @IsPublic, @OwnerId, GETUTCDATE(), 0)";

        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, playlist);
        return playlist.Id;
    }

    // 2. Authorization Query: Fast look up checking if OwnerId matches CurrentUserId
    public async Task<bool> IsOwnerAsync(Guid playlistId, Guid userId)
    {
        const string sql = @"
            SELECT COUNT(1) 
            FROM Playlists 
            WHERE Id = @PlaylistId AND OwnerId = @UserId AND IsDeleted = 0";

        using IDbConnection db = new SqlConnection(_connectionString);
        var counts = await db.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId, UserId = userId });
        return counts > 0;
    }

    // 3. Update Logic
    public async Task UpdateAsync(Playlist playlist)
    {
        const string sql = @"
            UPDATE Playlists 
            SET Title = @Title, Description = @Description, IsPublic = @IsPublic
            WHERE Id = @Id AND IsDeleted = 0";

        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, playlist);
    }
}