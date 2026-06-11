using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.History;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Yêu cầu người dùng phải đăng nhập (gửi kèm JWT token)
public class HistoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public HistoryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> RecordPlayHistory([FromBody] RecordHistoryRequest request)
    {
        // 1. Lấy UserId từ JWT Token đang đăng nhập
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ hoặc đã hết hạn."));
        }

        // 2. Map sang MediatR Command
        var command = new RecordPlayHistoryCommand
        {
            UserId = userId,
            MediaItemId = request.MediaItemId
        };

        // 3. Gửi sang MediatR xử lý
        bool result = await _mediator.Send(command);
        if (!result)
        {
            return BadRequest(ApiResponse<object>.SetFailure(message: "Không tìm thấy bài hát hoặc không thể ghi nhận lịch sử."));
        }

        return Ok(ApiResponse<bool>.SetSuccess(true, "Ghi nhận lịch sử nghe nhạc thành công!"));
    }
}

// Request Model nhận dữ liệu từ Body
public class RecordHistoryRequest
{
    public Guid MediaItemId { get; set; }
}
