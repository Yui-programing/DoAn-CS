using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.DTOs;
using TuneVault.Application.Models;

namespace TuneVault.Application.Repositories
{
    public interface ISearchRepository
    {
        // Hợp đồng cho tìm kiếm nhanh
        Task<QuickSearchResultDto> GetQuickSearchResultsAsync(string keyword, int limit);

        // Hợp đồng cho tìm kiếm phân trang
        Task<ResultPage<SearchItemDto>> GetFullSearchResultsAsync(string keyword, int pageNumber, int pageSize, string? filterType);
    }
}
