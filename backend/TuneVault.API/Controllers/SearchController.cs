using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.API.Common;
using TuneVault.Application.DTOs;
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
        public async Task<IActionResult> QuickSearch([FromQuery] string keyword, [FromQuery] int limit = 3)
        {
            var query = new QuickSearchQuery { Keyword = keyword, Limit = limit };

            // Nhận DTO từ Application
            QuickSearchResultDto data = await _mediator.Send(query);

            // Bọc vào ApiResponse tại tầng API
            var response = ApiResponse<QuickSearchResultDto>.SetSuccess(data, "Lấy dữ liệu tìm kiếm nhanh thành công.");
            return Ok(response);
        }

        [HttpGet("full")]
        public async Task<IActionResult> FullSearch([FromQuery] FullSearchQuery query)
        {
            // MediatR tự động map các query params (Keyword, PageNumber, PageSize) vào FullSearchQuery
            ResultPage<SearchItemDto> data = await _mediator.Send(query);

            var response = ApiResponse<ResultPage<SearchItemDto>>.SetSuccess(data, "Lấy dữ liệu tìm kiếm chi tiết thành công.");
            return Ok(response);
        }
    }
}
