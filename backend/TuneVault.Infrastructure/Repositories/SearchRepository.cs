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
            
            UNION
            
            SELECT DISTINCT TOP (@Limit) Title AS Text, 'Album' AS Type
            FROM Album 
            WHERE Title LIKE @Keyword
        
            ORDER BY Text ASC;"; // Có thể sắp xếp theo bảng chữ cái

            return await _dbConnection.QueryAsync<SuggestionResultDto>(sql, new { Keyword = safeKeyword, Limit = limit });
        }

        public async Task<ResultPage<SearchItemDto>> GetFullSearchResultsAsync(string keyword, int pageNumber, int pageSize, string? filterType)
        {
            int offset = (pageNumber - 1) * pageSize;
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            string sql = @"
            WITH SearchResults AS (
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, a.Name AS ArtistName, m.MediaType, m.ViewCount, m.DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM MediaItem m
                LEFT JOIN Artist a ON m.ArtistId = a.Id
                WHERE m.Title LIKE @Keyword AND m.ApprovalStatus = 'Approved' AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT a.Id, a.Name, 'Artist' AS Type, p.AvatarUrl AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CASE WHEN a.VerifiedAt IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsVerified
                FROM Artist a
                LEFT JOIN UserProfile p ON a.Id = p.Id
                WHERE a.Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
                UNION ALL
                SELECT Id, Title AS Name, 'Playlist' AS Type, NULL AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM Playlist
                WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
                UNION ALL
                SELECT p.Id, p.FullName AS Name, 'User' AS Type, p.AvatarUrl AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM UserProfile p
                INNER JOIN [User] u ON p.Id = u.Id
                WHERE p.FullName LIKE @Keyword AND p.IsPublic = 1 AND u.Role = 'User' AND (@FilterType IS NULL OR @FilterType = 'User')
                UNION ALL
                SELECT a.Id, a.Title AS Name, 'Album' AS Type, a.CoverImageUrl AS CoverUrl, ar.Name AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM Album a
                LEFT JOIN Artist ar ON a.ArtistId = ar.Id
                WHERE a.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Album')

            )
            SELECT COUNT(1) FROM SearchResults;

            WITH SearchResults AS (
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, a.Name AS ArtistName, m.MediaType, m.ViewCount, m.DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM MediaItem m
                LEFT JOIN Artist a ON m.ArtistId = a.Id
                WHERE m.Title LIKE @Keyword AND m.ApprovalStatus = 'Approved' AND (@FilterType IS NULL OR @FilterType = 'Song')
                UNION ALL
                SELECT a.Id, a.Name, 'Artist' AS Type, COALESCE(a.AvatarUrl, p.AvatarUrl) AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CASE WHEN a.VerifiedAt IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsVerified
                FROM Artist a
                LEFT JOIN UserProfile p ON a.Id = p.Id
                WHERE a.Name LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Artist')
                UNION ALL
                SELECT Id, Title AS Name, 'Playlist' AS Type, NULL AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM Playlist
                WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
                UNION ALL
                SELECT p.Id, p.FullName AS Name, 'User' AS Type, p.AvatarUrl AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM UserProfile p
                INNER JOIN [User] u ON p.Id = u.Id
                WHERE p.FullName LIKE @Keyword AND p.IsPublic = 1 AND u.Role = 'User' AND (@FilterType IS NULL OR @FilterType = 'User')
                UNION ALL
                SELECT a.Id, a.Title AS Name, 'Album' AS Type, a.CoverImageUrl AS CoverUrl, ar.Name AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds, CAST(0 AS BIT) AS IsVerified
                FROM Album a
                LEFT JOIN Artist ar ON a.ArtistId = ar.Id
                WHERE a.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Album')
            )
            SELECT * FROM SearchResults
            ORDER BY ViewCount DESC, Type, Name
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
