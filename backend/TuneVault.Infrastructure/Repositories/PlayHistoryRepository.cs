using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Features.History;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlayHistoryRepository : IPlayHistoryRepository
{
    private readonly string _connectionString;

    public PlayHistoryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<bool> AddPlayHistoryAsync(PlayHistory playHistory)
    {
        const string sql = @"
            INSERT INTO PlayHistory (Id, UserId, MediaItemId, PlayedAt)
            VALUES (@Id, @UserId, @MediaItemId, @PlayedAt)";

        using IDbConnection db = new SqlConnection(_connectionString);
        int rowAffected = await db.ExecuteAsync(sql, playHistory);
        return rowAffected > 0;
    }

    public async Task<IEnumerable<PlayHistoryResultDto>> GetPlayHistoryAsync(Guid userId, int limit)
    {
        const string sql = @"
            WITH RankedHistory AS (
                SELECT 
                    p.Id, p.UserId, p.MediaItemId, p.PlayedAt,
                    m.Id as MediaId, m.Title, m.ArtistName, m.CoverUrl, m.FilePath, 
                    m.DurationInSeconds, m.ViewCount, m.MediaType,
                    ROW_NUMBER() OVER(PARTITION BY p.MediaItemId ORDER BY p.PlayedAt DESC) as RowNum
                FROM PlayHistory p
                INNER JOIN MediaItem m ON p.MediaItemId = m.Id
                WHERE p.UserId = @UserId
            )
            SELECT 
                Id, UserId, MediaItemId, PlayedAt,
                MediaId as Id, Title, ArtistName, CoverUrl, FilePath, 
                DurationInSeconds, ViewCount, MediaType
            FROM RankedHistory
            WHERE RowNum = 1
            ORDER BY PlayedAt DESC
            OFFSET 0 ROWS FETCH NEXT @Limit ROWS ONLY";

        using IDbConnection db = new SqlConnection(_connectionString);
        var history = await db.QueryAsync<PlayHistoryResultDto, PlayHistoryMediaItemDto, PlayHistoryResultDto>(
            sql,
            (ph, m) => 
            {
                ph.MediaItem = m;
                return ph;
            },
            new { UserId = userId, Limit = limit },
            splitOn: "Id"
        );

        return history;
    }
}

