using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
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

        public async Task<IEnumerable<SuggestionResultDto>> GetQuickSearchResultsAsync(string keyword, int limit)
        {
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            string sql = @"
            SELECT DISTINCT TOP (@Limit) Title AS Text, 'Song' AS Type
            FROM MediaItem 
            WHERE Title LIKE @Keyword

            UNION

            SELECT DISTINCT TOP (@Limit) Name AS Text, 'Artist' AS Type
            FROM Artist 
            WHERE Name LIKE @Keyword
        
            ORDER BY Text ASC;"; // Có thể sắp xếp theo bảng chữ cái

            return await _dbConnection.QueryAsync<SuggestionResultDto>(sql, new { Keyword = safeKeyword, Limit = limit });
        }

        public async Task<ResultPage<SearchItemDto>> GetFullSearchResultsAsync(string keyword, int pageNumber, int pageSize, string? filterType)
        {
            int offset = (pageNumber - 1) * pageSize;
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            string sql = @"
            WITH SearchResults AS (
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, a.Name AS ArtistName
                FROM MediaItem m
                LEFT JOIN Artist a ON m.ArtistId = a.Id
                WHERE m.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT Id, Name, 'Artist' AS Type, AvatarUrl AS CoverUrl, NULL AS ArtistName
                FROM Artist 
                WHERE Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
            )
            SELECT COUNT(1) FROM SearchResults;

            WITH SearchResults AS (
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, a.Name AS ArtistName
                FROM MediaItem m
                LEFT JOIN Artist a ON m.ArtistId = a.Id
                WHERE m.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT Id, Name, 'Artist' AS Type, AvatarUrl AS CoverUrl, NULL AS ArtistName
                FROM Artist 
                WHERE Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
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
