using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;
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
}
