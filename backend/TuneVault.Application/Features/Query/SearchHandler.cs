using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Query
{
    
    public class QuickSearchQueryHandler : IRequestHandler<SuggestionQuery, IEnumerable<SuggestionResultDto>>
    {
        private readonly ISearchRepository _searchRepository;

        public QuickSearchQueryHandler(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        public async Task<IEnumerable<SuggestionResultDto>> Handle(SuggestionQuery request, CancellationToken cancellationToken)
        {
            
            return await _searchRepository.GetQuickSearchResultsAsync(request.Keyword, request.Limit);
        }
    }

    
    public class FullSearchQueryHandler : IRequestHandler<FullSearchQuery, ResultPage<SearchItemDto>>
    {
        private readonly ISearchRepository _searchRepository;

        public FullSearchQueryHandler(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        public async Task<ResultPage<SearchItemDto>> Handle(FullSearchQuery request, CancellationToken cancellationToken)
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize < 1) request.PageSize = 10;

            return await _searchRepository.GetFullSearchResultsAsync(
                request.Keyword,
                request.PageNumber,
                request.PageSize,
                request.FilterType);
        }
    }
}
