using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
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
            INSERT INTO Playlist (Id, Title, Description, IsPublic, OwnerId, CreatedAt, IsDeleted)
            VALUES (@Id, @Title, @Description, @IsPublic, @OwnerId, GETUTCDATE(), 0)";

        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, playlist);
        return playlist.Id;
    }

    // 2. Authorization Query: Fast look up checking if OwnerId matches CurrentUserId
    public async Task<bool> IsOwnerAsync(Guid playlistId, string userId)
    {
        const string sql = @"
            SELECT COUNT(1) 
            FROM Playlist 
            WHERE Id = @playlistId AND OwnerId = @userId";

        using IDbConnection db = new SqlConnection(_connectionString);
        var counts = await db.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId, UserId = userId });
        return counts > 0;
    }

    // 3. Update Logic
    public async Task UpdateAsync(Playlist playlist)
    {
        const string sql = @"
            UPDATE Playlist 
            SET Title = @title, Description = @description, IsPublic = @isPublic
            WHERE Id = @Id AND IsDeleted = 0";

        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, playlist);
    }

    public async Task DeleteAsync(Guid playlistId)
    {
        const string sql = @"
            UPDATE Playlist 
            SET IsDeleted = 1
            WHERE Id = @playlistId";
        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, new { PlaylistId = playlistId });
    }
    public async Task RestoreAsync(Guid playlistId)
    {
        const string sql = @"
            UPDATE Playlist 
            SET IsDeleted = 0
            WHERE Id = @playlistId";
        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, new { PlaylistId = playlistId });
    }
    /// <summary>
    /// Thêm bài hát vào Playlist và cập nhật số lượng Track
    /// </summary>
    public async Task AddTrackAsync(Guid playlistId, Guid mediaItemId)
    {
        // Dapper cho phép chạy nhiều câu lệnh SQL cùng lúc ngăn cách bởi dấu chấm phẩy (;)
        var sql = @"
                -- 1. Thêm bản ghi vào bảng trung gian
                INSERT INTO PlaylistTrack (PlaylistId, MediaItemId, AddedAt)
                VALUES (@playlistId, @mediaItemId, @AddedAt);

                -- 2. Tăng số đếm TracksCount của Playlist đó lên 1
                UPDATE Playlist
                SET TracksCount = TracksCount + 1
                WHERE Id = @playlistId AND IsDeleted = 0;
                
                --3. Tăng DurationCount
                UPDATE Playlist
                SET TotalDuration = TotalDuration + (SELECT DurationInSeconds FROM MediaItem WHERE Id = @mediaItemId)
                WHERE Id = @playlistId AND IsDeleted = 0;
            ";

        var parameters = new
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId,
            AddedAt = DateTime.UtcNow // Ghi lại thời gian thêm vào playlist
        };
        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, parameters);
    }
    /// <summary>
    /// Kiểm tra xem bài hát đã tồn tại trong playlist chưa
    /// </summary>
    public async Task<bool> IsMediaItemInPlaylistAsync(Guid playlistId, Guid mediaItemId)
    {
        // Lưu ý: Sửa tên bảng 'PlaylistMediaItems' cho khớp với tên bảng trong Database của bạn
        var sql = @"
                SELECT CASE WHEN EXISTS (
                    SELECT 1 
                    FROM PlaylistTrack 
                    WHERE PlaylistId = @playlistId AND MediaItemId = @mediaItemId
                ) THEN 1 ELSE 0 END";

        var parameters = new { PlaylistId = playlistId, MediaItemId = mediaItemId };
        using IDbConnection db = new SqlConnection(_connectionString);
        return await db.ExecuteScalarAsync<bool>(sql, parameters);
    }
    public async Task RemoveTrackAsync(Guid playlistId, Guid mediaItemId)
    {
        var sql = @"
                -- 1. Xóa bản ghi khỏi bảng trung gian
                DELETE FROM PlaylistTrack 
                WHERE PlaylistId = @playlistId AND MediaItemId = @mediaItemId;
                -- 2. Giảm số đếm TracksCount của Playlist đó xuống 1
                UPDATE Playlist
                SET TracksCount = TracksCount - 1
                WHERE Id = @playlistId and IsDeleted = 0;
                --3. Giảm DurationCount
                UPDATE Playlist
                SET TotalDuration = TotalDuration - (SELECT DurationInSeconds FROM MediaItem WHERE Id = @mediaItemId)
                WHERE Id = @playlistId and IsDeleted = 0;
            ";
        var parameters = new
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId
        };
        using IDbConnection db = new SqlConnection(_connectionString);
        await db.ExecuteAsync(sql, parameters);
    }

    // ✅ ĐÃ SỬA: Logic kiểm tra trùng tên bằng Dapper SQL
    public async Task<bool> IsTitleUniqueAsync(string title, Guid Id, string userId, CancellationToken cancellationToken)
    {
        // Viết câu lệnh SQL để đếm số lượng playlist trùng tên của cùng một User
        // Lưu ý: Tên cột trong DB của bạn là OwnerId (dựa vào hàm Create và IsOwner ở trên)
        const string sql = @"
            SELECT COUNT(1) 
            FROM Playlist 
            WHERE Title = @Title 
              AND OwnerId = @UserId 
              AND Id <> @PlaylistId 
              AND IsDeleted = 0";

        using IDbConnection db = new SqlConnection(_connectionString);

        // Sử dụng CommandDefinition của Dapper để có thể truyền được cancellationToken vào query
        var queryCommand = new CommandDefinition(sql, new { Title = title, UserId = userId, PlaylistId = Id }, cancellationToken: cancellationToken);

        var count = await db.ExecuteScalarAsync<int>(queryCommand);

        // Nếu count == 0 tức là KHÔNG có playlist nào bị trùng -> Trả về true (Hợp lệ)
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
        using IDbConnection db = new SqlConnection(_connectionString);
        return await db.ExecuteScalarAsync<bool>(sql, new { PlaylistId = playlistId });
    }
    public async Task<bool> IsPlaylistDeletedAsync(Guid playlistId)
    {
        const string sql = @"
            SELECT IsDeleted 
            FROM Playlist 
            WHERE Id = @playlistId";
        using IDbConnection db = new SqlConnection(_connectionString);
        return await db.ExecuteScalarAsync<bool>(sql, new { PlaylistId = playlistId });
    }

}