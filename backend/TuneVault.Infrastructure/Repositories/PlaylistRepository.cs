using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlaylistRepository : IPlaylistRepository
{
    private readonly IDbConnection _dbConnection;

    public PlaylistRepository(IDbConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<Guid> CreateAsync(Playlist playlist)
    {
        const string sql = @"
            INSERT INTO Playlist (Id, Title, Description, IsPublic, OwnerId, CreatedAt)
            VALUES (@Id, @Title, @Description, @IsPublic, @OwnerId, GETUTCDATE())";

        await _dbConnection.ExecuteAsync(sql, playlist);
        return playlist.Id;
    }

    public async Task<bool> IsOwnerAsync(Guid playlistId, Guid userId)
    {
        const string sql = @"
            SELECT COUNT(1) 
            FROM Playlist 
            WHERE Id = @playlistId AND OwnerId = @userId";

        var counts = await _dbConnection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId, UserId = userId });
        return counts > 0;
    }

    public async Task UpdateAsync(Playlist playlist)
    {
        const string sql = @"
            UPDATE Playlist 
            SET Title = @title, Description = @description, IsPublic = @isPublic
            WHERE Id = @Id";

        await _dbConnection.ExecuteAsync(sql, playlist);
    }

    public async Task DeleteAsync(Guid playlistId)
    {
        const string sql = @"
            DELETE FROM PlaylistTrack 
            WHERE PlaylistId = @playlistId;

            DELETE FROM Playlist 
            WHERE Id = @playlistId;";

        await _dbConnection.ExecuteAsync(sql, new { PlaylistId = playlistId });
    }

    public async Task AddTrackAsync(Guid playlistId, Guid mediaItemId)
    {
        var sql = @"
            INSERT INTO PlaylistTrack (PlaylistId, MediaItemId, AddedAt)
            VALUES (@playlistId, @mediaItemId, @AddedAt);

            UPDATE Playlist
            SET TracksCount = TracksCount + 1
            WHERE Id = @playlistId;
            
            UPDATE Playlist
            SET TotalDuration = TotalDuration + (SELECT DurationInSeconds FROM MediaItem WHERE Id = @mediaItemId)
            WHERE Id = @playlistId;";

        var parameters = new
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId,
            AddedAt = DateTime.UtcNow
        };

        await _dbConnection.ExecuteAsync(sql, parameters);
    }

    public async Task<bool> IsMediaItemInPlaylistAsync(Guid playlistId, Guid mediaItemId)
    {
        var sql = @"
            SELECT CASE WHEN EXISTS (
                SELECT 1 
                FROM PlaylistTrack 
                WHERE PlaylistId = @playlistId AND MediaItemId = @mediaItemId
            ) THEN 1 ELSE 0 END";

        var parameters = new { PlaylistId = playlistId, MediaItemId = mediaItemId };
        return await _dbConnection.ExecuteScalarAsync<bool>(sql, parameters);
    }

    public async Task RemoveTrackAsync(Guid playlistId, Guid mediaItemId)
    {
        var sql = @"
            DELETE FROM PlaylistTrack 
            WHERE PlaylistId = @playlistId AND MediaItemId = @mediaItemId;
            
            UPDATE Playlist
            SET TracksCount = TracksCount - 1
            WHERE Id = @playlistId;
            
            UPDATE Playlist
            SET TotalDuration = TotalDuration - (SELECT DurationInSeconds FROM MediaItem WHERE Id = @mediaItemId)
            WHERE Id = @playlistId;";

        var parameters = new
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId
        };

        await _dbConnection.ExecuteAsync(sql, parameters);
    }

    public async Task<bool> IsTitleUniqueAsync(string title, Guid Id, Guid userId, CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT COUNT(1) 
            FROM Playlist 
            WHERE Title = @Title 
              AND OwnerId = @UserId 
              AND Id <> @PlaylistId";

        var queryCommand = new CommandDefinition(sql, new { Title = title, UserId = userId, PlaylistId = Id }, cancellationToken: cancellationToken);

        var count = await _dbConnection.ExecuteScalarAsync<int>(queryCommand);
        return count == 0;
    }

    public async Task<bool> IsPlaylistEmptyAsync(Guid playlistId)
    {
        const string sql = @"
            SELECT CASE WHEN EXISTS (
                SELECT 1 
                FROM PlaylistTrack 
                WHERE PlaylistId = @playlistId
            ) THEN 0 ELSE 1 END";

        return await _dbConnection.ExecuteScalarAsync<bool>(sql, new { PlaylistId = playlistId });
    }

    public async Task<bool> IsPlaylistDeletedAsync(Guid playlistId)
    {
        const string sql = @"SELECT COUNT(1) FROM Playlist WHERE Id = @playlistId";

        var count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId });
        return count == 0;
    }

    public async Task<bool> HasAccessAsync(Guid playlistId, Guid userId)
    {
        const string sql = @"
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM Playlist p
                LEFT JOIN MediaShare s ON p.Id = s.PlaylistId AND s.ReceiverId = @UserId
                WHERE p.Id = @PlaylistId AND (p.IsPublic = 1 OR p.OwnerId = @UserId OR s.Id IS NOT NULL)
            ) THEN 1 ELSE 0 END";

        return await _dbConnection.ExecuteScalarAsync<bool>(sql, new { PlaylistId = playlistId, UserId = userId });
    }

    public async Task<IEnumerable<MyPlaylistDto>> GetByOwnerIdAsync(Guid userId)
    {
        const string sql = @"
            SELECT Id, Title, Description, IsPublic, OwnerId, CreatedAt, TracksCount, TotalDuration
            FROM Playlist 
            WHERE OwnerId = @UserId
            ORDER BY CreatedAt DESC";

        return await _dbConnection.QueryAsync<MyPlaylistDto>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<MyPlaylistDto>> GetPublicByUserIdAsync(Guid userId)
    {
        const string sql = @"
            SELECT Id, Title, Description, IsPublic, OwnerId, CreatedAt, TracksCount, TotalDuration
            FROM Playlist 
            WHERE OwnerId = @UserId AND IsPublic = 1
            ORDER BY CreatedAt DESC";

        return await _dbConnection.QueryAsync<MyPlaylistDto>(sql, new { UserId = userId });
    }

    public async Task<MyPlaylistDto?> GetByIdAsync(Guid playlistId)
    {
        const string sql = @"
            SELECT Id, Title, Description, IsPublic, OwnerId, CreatedAt, TracksCount, TotalDuration
            FROM Playlist 
            WHERE Id = @PlaylistId";

        return await _dbConnection.QueryFirstOrDefaultAsync<MyPlaylistDto>(sql, new { PlaylistId = playlistId });
    }

    public async Task<IEnumerable<PlaylistTrackDto>> GetTracksByPlaylistIdAsync(Guid playlistId)
    {
        const string sql = @"
            SELECT 
                m.Id AS MediaItemId, 
                m.Title, 
                a.Name AS ArtistName,
                m.CoverUrl,
                m.DurationInSeconds, 
                m.MediaType,
                pt.AddedAt
            FROM PlaylistTrack pt
            INNER JOIN MediaItem m ON pt.MediaItemId = m.Id
            LEFT JOIN Artist a ON m.ArtistId = a.Id
            WHERE pt.PlaylistId = @PlaylistId
            ORDER BY pt.AddedAt DESC";

        return await _dbConnection.QueryAsync<PlaylistTrackDto>(sql, new { PlaylistId = playlistId });
    }
}