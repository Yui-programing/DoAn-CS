using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Query
{
    // Query 1: Tìm kiếm nhanh (Search Bar)
    public class SuggestionQuery : IRequest<IEnumerable<SuggestionResultDto>>
    {
        public string Keyword { get; set; } = string.Empty;
        public int Limit { get; set; } = 5;
    }

    // Query 2: Tìm kiếm đầy đủ có phân trang (Search Page)
    public class FullSearchQuery : IRequest<ResultPage<SearchItemDto>>
    {
        public string Keyword { get; set; } = string.Empty;
        public int PageNumber { get; set; } = 1;
        
        internal int PageSize { get; set; } = 10;
        public string? FilterType { get; set; }
    }
}
