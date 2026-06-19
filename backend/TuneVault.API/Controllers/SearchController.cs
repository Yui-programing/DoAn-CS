using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.API.Common;
using TuneVault.Application.Features.Query;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SearchController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("quick")]
        public async Task<IActionResult> QuickSearch([FromQuery] string keyword)
        {
            var query = new SuggestionQuery { Keyword = keyword };

            // Nh?n DTO t? Application
            var data = await _mediator.Send(query);

            // B?c vào ApiResponse t?i t?ng API
            var response = ApiResponse<IEnumerable<SuggestionResultDto>>.SetSuccess(data, "L?y d? li?u tìm ki?m nhanh thành công.");
            return Ok(response);
        }

        [HttpGet("full")]
        public async Task<IActionResult> FullSearch([FromQuery] FullSearchQuery query)
        {
            if (string.IsNullOrWhiteSpace(query.Keyword))
            {
                return Ok(ApiResponse<ResultPage<SearchItemDto>>.SetSuccess(new ResultPage<SearchItemDto>(), "Keyword không du?c d? tr?ng."));
            }

            
            // MediatR t? d?ng map các query params (Keyword, PageNumber, PageSize) vào FullSearchQuery
            var data = await _mediator.Send(query);

            var response = ApiResponse<ResultPage<SearchItemDto>>.SetSuccess(data, "L?y d? li?u tìm ki?m chi ti?t thành công.");
            return Ok(response);
        }
    }
}

