using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using TuneVault.Application.DTOs;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using Dapper;

namespace TuneVault.Infrastructure.Repositories
{
    public class SearchRepository : ISearchRepository
    {
        private readonly IDbConnection _dbConnection;

        public SearchRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<QuickSearchResultDto> GetQuickSearchResultsAsync(string keyword, int limit)
        {
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            string sql = @"
            SELECT TOP (@Limit) Id, Title AS Name, 'Song' AS Type, CoverImageUrl AS ImageUrl 
            FROM MediaItem WHERE Title LIKE @Keyword;

            SELECT TOP (@Limit) Id, StageName AS Name, 'Artist' AS Type, AvatarUrl AS ImageUrl 
            FROM Artist WHERE StageName LIKE @Keyword;

            SELECT TOP (@Limit) Id, Name, 'Playlist' AS Type, ThumbnailUrl AS ImageUrl 
            FROM Playlist WHERE Name LIKE @Keyword;
        ";

            using var multi = await _dbConnection.QueryMultipleAsync(sql, new { Keyword = safeKeyword, Limit = limit });

            return new QuickSearchResultDto
            {
                TopSongs = await multi.ReadAsync<SearchItemDto>(),
                TopArtists = await multi.ReadAsync<SearchItemDto>(),
                TopPlaylists = await multi.ReadAsync<SearchItemDto>()
            };
        }

        public async Task<ResultPage<SearchItemDto>> GetFullSearchResultsAsync(string keyword, int pageNumber, int pageSize, string? filterType)
        {
            int offset = (pageNumber - 1) * pageSize;
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            string sql = @"
            WITH SearchResults AS (
                SELECT Id, Title AS Name, 'Song' AS Type, CoverImageUrl AS ImageUrl 
                FROM MediaItem WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT Id, StageName AS Name, 'Artist' AS Type, AvatarUrl AS ImageUrl 
                FROM Artist WHERE StageName LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
                UNION ALL
                SELECT Id, Name, 'Playlist' AS Type, ThumbnailUrl AS ImageUrl 
                FROM Playlist WHERE Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
            )
            SELECT COUNT(1) FROM SearchResults;

            WITH SearchResults AS (
                SELECT Id, Title AS Name, 'Song' AS Type, CoverImageUrl AS ImageUrl 
                FROM MediaItem WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT Id, StageName AS Name, 'Artist' AS Type, AvatarUrl AS ImageUrl 
                FROM Artist WHERE StageName LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
                UNION ALL
                SELECT Id, Name, 'Playlist' AS Type, ThumbnailUrl AS ImageUrl 
                FROM Playlist WHERE Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
            )
            SELECT * FROM SearchResults
            ORDER BY Type, Name
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
        ";

            var parameters = new { Keyword = safeKeyword, Offset = offset, PageSize = pageSize, FilterType = filterType };

            using var multi = await _dbConnection.QueryMultipleAsync(sql, parameters);

            return new ResultPage<SearchItemDto>
            {
                TotalCount = await multi.ReadFirstAsync<int>(),
                Items = await multi.ReadAsync<SearchItemDto>(),
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
