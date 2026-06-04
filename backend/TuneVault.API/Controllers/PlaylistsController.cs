using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack;
using TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;
using TuneVault.Application.Features.Playlists.Commands.DeletePlaylist;
using TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack;
using TuneVault.Application.Features.Playlists.Commands.RestorePlaylist;
using TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;

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
        command.OwnerId = nameIdentifier;

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

    [Authorize]
    [HttpPut("{id:guid}")]
    // Hứng thẳng UpdatePlaylistCommand từ Body
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistCommand command)
    {
        // 1. Trích xuất OwnerId từ JWT Token
        var userIdFromJwt = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdFromJwt))
        {
            return Unauthorized(new { message = "Token không hợp lệ hoặc thiếu thông tin user." });
        }

        // 2. ⚠️ BƯỚC GHI ĐÈ BẮT BUỘC (QUAN TRỌNG)
        // Vì Frontend có thể cố tình gửi chữ OwnerId hoặc Id bậy bạ vào trong cục JSON,
        // nên ta bắt buộc phải ép lại giá trị chuẩn từ URL và JWT để bảo mật:
        command.Id = id;
        command.OwnerId = userIdFromJwt;

        // 3. Gửi thẳng Command sang Handler
        var response = await _mediator.Send(command);

        // 4. Trả kết quả
        if (response.Message == "Update playlist bị lỗi" || response.Data == Guid.Empty)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [Authorize] // Bắt buộc phải có JWT
    [HttpDelete("{id:guid}")] // Dùng HttpDelete thay vì HttpPut
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        // 1. Trích xuất OwnerId (kiểu string) trực tiếp từ JWT Token
        var userIdFromJwt = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdFromJwt))
        {
            return Unauthorized(new { message = "Token không hợp lệ hoặc thiếu thông tin user." });
        }

        // 2. Khởi tạo Command trực tiếp bằng code thay vì hứng từ [FromBody]
        var command = new DeletePlaylistCommand
        {
            Id = id,                         // Lấy từ URL (/api/playlists/b2a1...)
            OwnerId = userIdFromJwt          // Lấy từ Token
        };

        // 3. Gửi Command sang Handler qua MediatR
        var response = await _mediator.Send(command);

        // 4. Xử lý phản hồi
        if (response.Message == "Delete playlist bị lỗi" || response.Data == Guid.Empty)
        {
            // Trả về HTTP 400 Bad Request nếu lỗi
            return BadRequest(response);
        }

        // Trả về HTTP 200 OK nếu thành công
        return Ok(response);
    }

    [Authorize] // Bắt buộc phải có JWT
    [HttpPatch("{id:guid}/restore")] // Dùng HttpPatch để cập nhật một phần nhỏ của dữ liệu
    public async Task<IActionResult> RestorePlaylist(Guid id)
    {
        // 1. Trích xuất OwnerId (kiểu string) trực tiếp từ JWT Token
        var userIdFromJwt = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdFromJwt))
        {
            return Unauthorized(new { message = "Token không hợp lệ hoặc thiếu thông tin user." });
        }

        // 2. Khởi tạo Command trực tiếp bằng code thay vì hứng từ [FromBody]
        var command = new RestorePlaylistCommand
        {
            Id = id,                         // Lấy từ URL (/api/playlists/b2a1...)
            OwnerId = userIdFromJwt          // Lấy từ Token
        };

        // 3. Gửi Command sang Handler qua MediatR
        var response = await _mediator.Send(command);

        // 4. Xử lý phản hồi
        if (response.Message == "Restore playlist bị lỗi" || response.Data == Guid.Empty)
        {
            // Trả về HTTP 400 Bad Request nếu lỗi
            return BadRequest(response);
        }

        // Trả về HTTP 200 OK nếu thành công
        return Ok(response);
    }

    [Authorize]
    [HttpPost("{id:guid}/tracks")] // Route: /api/playlists/b2a1.../tracks
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, [FromBody] AddPlaylistTrackCommand command)
    {
        // 1. Lấy ID người dùng từ JWT
        var userIdFromJwt = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdFromJwt))
        {
            return Unauthorized(new { message = "Token không hợp lệ." });
        }

        command.PlaylistId = id; // Lấy PlaylistId từ URL
        command.UserId = userIdFromJwt;                         

        // 3. Gửi cho MediatR
        var response = await _mediator.Send(command);

        if (response.Message == "Lỗi xác thực" || response.Message == "Lỗi dữ liệu")
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("{id:guid}/tracks/{trackId:guid}")]
    public async Task<IActionResult> RemoveTrackFromPlaylist(Guid id, Guid trackId)
    {
        // 1. Lấy ID người dùng từ JWT
        var userIdFromJwt = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdFromJwt))
        {
            return Unauthorized(new { message = "Token không hợp lệ." });
        }

        // 2. Gom dữ liệu vào Command
        var command = new RemovePlaylistTrackCommand
        {
            PlaylistId = id,          // Lấy cái id đầu tiên trên URL
            MediaItemId = trackId,        // Lấy cái trackId thứ hai trên URL
            UserId = userIdFromJwt    // Lấy từ token
        };

        // 3. Gửi cho MediatR
        var response = await _mediator.Send(command);

        if (response.Message == "Lỗi xác thực")
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

}