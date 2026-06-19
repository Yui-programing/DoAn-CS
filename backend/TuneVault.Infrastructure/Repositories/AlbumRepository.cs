using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories
{
    public class AlbumRepository : IAlbumRepository
    {
        private readonly IDbConnection _dbConnection;

        public AlbumRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<Guid> CreateAlbumAsync(Album album)
        {
            album.Id = Guid.NewGuid();
            const string sql = @"
                INSERT INTO Album (Id, Title, CoverImageUrl, ReleaseDate, ArtistId)
                VALUES (@Id, @Title, @CoverImageUrl, @ReleaseDate, @ArtistId);
            ";
            await _dbConnection.ExecuteAsync(sql, album);
            return album.Id;
        }

        public async Task<AlbumDto?> GetAlbumByIdAsync(Guid albumId)
        {
            const string sql = @"
                SELECT a.Id, a.Title, a.CoverImageUrl, a.ReleaseDate, a.ArtistId, ar.Name as ArtistName
                FROM Album a
                LEFT JOIN Artist ar ON a.ArtistId = ar.Id
                WHERE a.Id = @Id
            ";
            return await _dbConnection.QueryFirstOrDefaultAsync<AlbumDto>(sql, new { Id = albumId });
        }

        public async Task<IEnumerable<AlbumDto>> GetAlbumsByArtistIdAsync(Guid artistId)
        {
            const string sql = @"
                SELECT a.Id, a.Title, a.CoverImageUrl, a.ReleaseDate, a.ArtistId, ar.Name as ArtistName
                FROM Album a
                LEFT JOIN Artist ar ON a.ArtistId = ar.Id
                WHERE a.ArtistId = @ArtistId
                ORDER BY a.ReleaseDate DESC
            ";
            return await _dbConnection.QueryAsync<AlbumDto>(sql, new { ArtistId = artistId });
        }

        public async Task<bool> UpdateMediaItemsAlbumAsync(Guid albumId, string albumName, List<Guid> mediaItemIds, Guid artistId)
        {
            if (mediaItemIds == null || mediaItemIds.Count == 0) return true;

            const string sql = @"
                UPDATE MediaItem
                SET AlbumId = @AlbumId
                WHERE Id IN @MediaItemIds AND ArtistId = @ArtistId
            ";
            
            int rowsAffected = await _dbConnection.ExecuteAsync(sql, new 
            { 
                AlbumId = albumId, 
                MediaItemIds = mediaItemIds,
                ArtistId = artistId
            });
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<PlaylistTrackDto>> GetTracksByAlbumIdAsync(Guid albumId)
        {
            const string sql = @"
                SELECT 
                    m.Id AS MediaItemId, 
                    m.Title, 
                    a.Name AS ArtistName,
                    m.CoverUrl,
                    m.DurationInSeconds, 
                    m.MediaType,
                    GETUTCDATE() AS AddedAt
                FROM MediaItem m
                LEFT JOIN Artist a ON m.ArtistId = a.Id
                WHERE m.AlbumId = @AlbumId
                ORDER BY m.Title ASC";

            return await _dbConnection.QueryAsync<PlaylistTrackDto>(sql, new { AlbumId = albumId });
        }
    }
}
