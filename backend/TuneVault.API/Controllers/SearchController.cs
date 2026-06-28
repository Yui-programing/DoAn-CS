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

            var data = await _mediator.Send(query);

            var response = ApiResponse<IEnumerable<SuggestionResultDto>>.SetSuccess(data, "Lấy dữ liệu tìm kiếm nhanh thành công.");
            return Ok(response);
        }

        [HttpGet("full")]
        public async Task<IActionResult> FullSearch([FromQuery] FullSearchQuery query)
        {
            if (string.IsNullOrWhiteSpace(query.Keyword))
            {
                return Ok(ApiResponse<ResultPage<SearchItemDto>>.SetSuccess(new ResultPage<SearchItemDto>(), "Keyword không được để trống."));
            }

            var data = await _mediator.Send(query);

            var response = ApiResponse<ResultPage<SearchItemDto>>.SetSuccess(data, "Lấy dữ liệu tìm kiếm chi tiết thành công.");
            return Ok(response);
        }
    }
}