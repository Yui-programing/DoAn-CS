using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.DTOs;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Query
{
    // Handler cho Quick Search
    public class QuickSearchQueryHandler : IRequestHandler<QuickSearchQuery, QuickSearchResultDto>
    {
        private readonly ISearchRepository _searchRepository;

        public QuickSearchQueryHandler(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        public async Task<QuickSearchResultDto> Handle(QuickSearchQuery request, CancellationToken cancellationToken)
        {
            // Có thể thêm logic kiểm tra/validation nghiệp vụ ở đây trước khi gọi DB
            return await _searchRepository.GetQuickSearchResultsAsync(request.Keyword, request.Limit);
        }
    }

    // Handler cho Full Search
    public class FullSearchQueryHandler : IRequestHandler<FullSearchQuery, ResultPage<SearchItemDto>>
    {
        private readonly ISearchRepository _searchRepository;

        public FullSearchQueryHandler(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        public async Task<ResultPage<SearchItemDto>> Handle(FullSearchQuery request, CancellationToken cancellationToken)
        {
            return await _searchRepository.GetFullSearchResultsAsync(
                request.Keyword,
                request.PageNumber,
                request.PageSize,
                request.FilterType);
        }
    }
}
