using Dapper;
using System;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class OtpRepository : IOtpRepository
    {
        private readonly IDbConnection _dbConnection;

        public OtpRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<bool> AddAsync(OtpVerification otp)
        {
            const string sql = @"
                INSERT INTO OtpVerification (Id, Email, OtpCode, Purpose, CreatedAt, ExpiresAt, IsUsed)
                VALUES (@Id, @Email, @OtpCode, @Purpose, @CreatedAt, @ExpiresAt, @IsUsed)";
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, otp);
            return rowsAffected > 0;
        }

        public async Task<OtpVerification?> GetLatestUnusedOtpAsync(string email, string purpose)
        {
            const string sql = @"
                SELECT TOP 1 * 
                FROM OtpVerification 
                WHERE Email = @Email 
                  AND Purpose = @Purpose 
                  AND IsUsed = 0 
                  AND ExpiresAt > GETUTCDATE()
                ORDER BY CreatedAt DESC";
            return await _dbConnection.QueryFirstOrDefaultAsync<OtpVerification>(sql, new { Email = email, Purpose = purpose });
        }

        public async Task<bool> MarkAsUsedAsync(Guid id)
        {
            const string sql = "UPDATE OtpVerification SET IsUsed = 1 WHERE Id = @Id";
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }
    }
}
