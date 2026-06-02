using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;

namespace TuneVault.API.Controllers;

[Authorize] // Enforces JWT Token verification automatically
[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlaylistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistCommand command)
    {
        // 1. Rút trực tiếp chuỗi string UserId từ JWT Token ra
        var nameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(nameIdentifier))
        {
            return Unauthorized(new { message = "Không tìm thấy thông tin UserId trong Token." }); // 401
        }

        // 2. Gán thẳng string vào string -> Hết sạch lỗi gạch đỏ!
        command.CurrentUserId = nameIdentifier;

        // 3. Gửi command đi xử lý tiếp ở tầng Application
        var result = await _mediator.Send(command);

        // 4. Response Mapping (Giữ nguyên đoạn bên dưới của bạn)
        if (!result.Success)
        {
            if (result.Message == "FORBIDDEN")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Access Denied: Resource ownership required." });
            }
            return BadRequest(result);
        }

        return Ok(result);
    }
}