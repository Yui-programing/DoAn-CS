using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;
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

            // Sửa cột FullName thành ArtistName để đúng cấu trúc bảng MediaItem
            string sql = @"
            SELECT DISTINCT TOP (@Limit) Title AS Text, 'Song' AS Type
            FROM MediaItem 
            WHERE Title LIKE @Keyword

            UNION

            SELECT DISTINCT TOP (@Limit) ArtistName AS Text, 'Artist' AS Type
            FROM MediaItem
            WHERE ArtistName LIKE @Keyword AND ArtistName IS NOT NULL
        
            ORDER BY Text ASC;";

            return await _dbConnection.QueryAsync<SuggestionResultDto>(sql, new { Keyword = safeKeyword, Limit = limit });
        }

        public async Task<ResultPage<SearchItemDto>> GetFullSearchResultsAsync(string keyword, int pageNumber, int pageSize, string? filterType)
        {
            int offset = (pageNumber - 1) * pageSize;
            string safeKeyword = string.IsNullOrWhiteSpace(keyword) ? "" : $"%{keyword.Trim()}%";

            // Chuyển logic Artist sang lấy từ cột ArtistName trong MediaItem
            // Dùng GROUP BY ArtistName để gom cụm, lấy Max(CoverUrl) làm đại diện hoặc để NULL
            string sql = @"
            WITH SearchResults AS (
                -- 1. Tìm kiếm theo Bài hát (Song)
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, m.ArtistName, m.MediaType, m.ViewCount, m.DurationInSeconds
                FROM MediaItem m
                WHERE m.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                
                UNION ALL
                
                -- 2. Tìm kiếm theo Nghệ sĩ (Artist) - Lấy từ cột ArtistName của MediaItem
                SELECT MIN(Id) AS Id, ArtistName AS Name, 'Artist' AS Type, MAX(CoverUrl) AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, SUM(ViewCount) AS ViewCount, 0 AS DurationInSeconds
                FROM MediaItem
                WHERE ArtistName LIKE @Keyword AND ArtistName IS NOT NULL AND (@FilterType IS NULL OR @FilterType = 'Artist')
                GROUP BY ArtistName
                
                UNION ALL
                
                -- 3. Tìm kiếm theo danh sách phát (Playlist)
                SELECT Id, Title AS Name, 'Playlist' AS Type, NULL AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds
                FROM Playlist
                WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
            )
            SELECT COUNT(1) FROM SearchResults;

            WITH SearchResults AS (
                -- 1. Tìm kiếm theo Bài hát (Song)
                SELECT m.Id, m.Title AS Name, 'Song' AS Type, m.CoverUrl, m.ArtistName, m.MediaType, m.ViewCount, m.DurationInSeconds
                FROM MediaItem m
                WHERE m.Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Song')
                
                UNION ALL
                
                -- 2. Tìm kiếm theo Nghệ sĩ (Artist) - Lấy từ cột ArtistName của MediaItem
                SELECT MIN(Id) AS Id, ArtistName AS Name, 'Artist' AS Type, MAX(CoverUrl) AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, SUM(ViewCount) AS ViewCount, 0 AS DurationInSeconds
                FROM MediaItem
                WHERE ArtistName LIKE @Keyword AND ArtistName IS NOT NULL AND (@FilterType IS NULL OR @FilterType = 'Artist')
                GROUP BY ArtistName
                
                UNION ALL
                
                -- 3. Tìm kiếm theo danh sách phát (Playlist)
                SELECT Id, Title AS Name, 'Playlist' AS Type, NULL AS CoverUrl, NULL AS ArtistName, 0 AS MediaType, 0 AS ViewCount, 0 AS DurationInSeconds
                FROM Playlist
                WHERE Title LIKE @Keyword AND (@FilterType IS NULL OR @FilterType = 'Playlist')
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