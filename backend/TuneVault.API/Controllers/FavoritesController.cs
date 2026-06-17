using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Favorites.Commands.AddFavorite;
using TuneVault.Application.Features.Favorites.Commands.RemoveFavorite;
using TuneVault.Application.Features.Favorites.Queries.GetFavorites;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{
    public class AddFavoriteRequest
    {
        public Guid MediaItemId { get; set; }
    }

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FavoritesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private string? GetUserIdFromJwt() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequest request)
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new AddFavoriteCommand
            {
                UserId = userId,
                MediaItemId = request.MediaItemId
            };

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<bool>.SetSuccess(result, "Thả tim bài hát thành công!"));
        }

        [HttpDelete("{mediaId:guid}")]
        public async Task<IActionResult> RemoveFavorite(Guid mediaId)
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new RemoveFavoriteCommand
            {
                UserId = userId,
                MediaItemId = mediaId
            };

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<bool>.SetSuccess(result, "Bỏ thả tim bài hát thành công!"));
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var query = new GetFavoritesQuery
            {
                UserId = userId
            };

            var favorites = await _mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<FavoriteDto>>.SetSuccess(favorites, "Lấy danh sách yêu thích thành công!"));
        }
    }
}
