using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Application.DTOs;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Query
{
    // Query 1: Tìm kiếm nhanh (Search Bar)
    public class QuickSearchQuery : IRequest<QuickSearchResultDto>
    {
        public string Keyword { get; set; } = string.Empty;
        public int Limit { get; set; } = 3;
    }

    // Query 2: Tìm kiếm đầy đủ có phân trang (Search Page)
    public class FullSearchQuery : IRequest<ResultPage<SearchItemDto>>
    {
        public string Keyword { get; set; } = string.Empty;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? FilterType { get; set; }
    }
}
