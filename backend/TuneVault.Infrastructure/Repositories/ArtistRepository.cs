using Dapper;
using System.Data;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class ArtistRepository : IArtistRepository
    {
        private readonly IDbConnection _dbConnection;

        public ArtistRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<bool> AddArtistAsync(Artist artist)
        {
            var sql = @"
                INSERT INTO Artist (Id, Name, Bio, AvatarUrl, Genres, BannerUrl, VerifiedAt) 
                VALUES (@Id, @Name, @Bio, @AvatarUrl, @Genres, @BannerUrl, @VerifiedAt)";
            
            var rowsAffected = await _dbConnection.ExecuteAsync(sql, artist);
            return rowsAffected > 0;
        }

        public async Task<Artist?> GetArtistByIdAsync(Guid artistId)
        {
            var sql = "SELECT * FROM Artist WHERE Id = @Id";
            return await _dbConnection.QueryFirstOrDefaultAsync<Artist>(sql, new { Id = artistId });
        }

        public async Task<bool> UpdateBannerAsync(Guid artistId, string bannerUrl)
        {
            var sql = "UPDATE Artist SET BannerUrl = @BannerUrl WHERE Id = @Id";
            var rowsAffected = await _dbConnection.ExecuteAsync(sql, new { Id = artistId, BannerUrl = bannerUrl });
            return rowsAffected > 0;
        }
    }
}
