using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class ArtistRegistrationRepository : IArtistRegistrationRepository
    {
        private readonly IDbConnection _dbConnection;

        public ArtistRegistrationRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<Guid> AddAsync(ArtistRegistration registration)
        {
            const string sql = @"
                INSERT INTO ArtistRegistrations (Id, UserId, StageName, Genres, IdCardUrl, Status, SubmittedAt, ReviewedAt)
                VALUES (@Id, @UserId, @StageName, @Genres, @IdCardUrl, @Status, @SubmittedAt, @ReviewedAt);
            ";

            var rows = await _dbConnection.ExecuteAsync(sql, registration);
            return registration.Id;
        }

        public async Task<IEnumerable<ArtistRegistration>> GetPendingAsync()
        {
            const string sql = "SELECT * FROM ArtistRegistrations WHERE Status = 'Pending' ORDER BY SubmittedAt DESC";
            return await _dbConnection.QueryAsync<ArtistRegistration>(sql);
        }

        public async Task<ArtistRegistration?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM ArtistRegistrations WHERE Id = @Id";
            return await _dbConnection.QueryFirstOrDefaultAsync<ArtistRegistration>(sql, new { Id = id });
        }

        public async Task<bool> UpdateStatusAsync(Guid id, string status, DateTime? reviewedAt = null)
        {
            const string sql = "UPDATE ArtistRegistrations SET Status = @Status, ReviewedAt = @ReviewedAt WHERE Id = @Id";
            int rows = await _dbConnection.ExecuteAsync(sql, new { Status = status, ReviewedAt = reviewedAt, Id = id });
            return rows > 0;
        }

        public async Task<IEnumerable<ArtistRegistration>> GetByUserIdAsync(Guid userId)
        {
            const string sql = "SELECT * FROM ArtistRegistrations WHERE UserId = @UserId ORDER BY SubmittedAt DESC";
            return await _dbConnection.QueryAsync<ArtistRegistration>(sql, new { UserId = userId });
        }
    }
}

