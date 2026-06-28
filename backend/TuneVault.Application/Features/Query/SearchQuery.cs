using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Query
{
    
    public class SuggestionQuery : IRequest<IEnumerable<SuggestionResultDto>>
    {
        public string Keyword { get; set; } = string.Empty;
        public int Limit { get; set; } = 5;
    }

    
    public class FullSearchQuery : IRequest<ResultPage<SearchItemDto>>
    {
        public string Keyword { get; set; } = string.Empty;
        public int PageNumber { get; set; } = 1;
        internal int PageSize { get; set; } = 50;
        public string? FilterType { get; set; }
    }
}
