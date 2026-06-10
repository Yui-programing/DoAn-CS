using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack;
using TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;
using TuneVault.Application.Features.Playlists.Commands.DeletePlaylist;
using TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack;
using TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;
using TuneVault.Application.Features.Playlists.Commands.ViewPlaylist;
using TuneVault.Application.Features.Playlists.Commands.ViewPlaylistTrack;
using TuneVault.Application.Models;


namespace TuneVault.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlaylistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Hàm helper rút nhanh UserId từ JWT Token
    private string? GetUserIdFromJwt() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new CreatePlaylistCommand
        {
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = userId
        };

        var result = await _mediator.Send(command);

        // Sử dụng SetSuccess theo file ApiResponse của bạn
        return Ok(ApiResponse<Guid>.SetSuccess(result, "Tạo playlist thành công!"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        // Đảm bảo ID được lấy từ URL và gán vào request
        var command = new UpdatePlaylistCommand
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = userId
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Cập nhật playlist thành công!"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new DeletePlaylistCommand { Id = id, OwnerId = userId };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Xóa playlist thành công!"));
    }

    

    [HttpPost("{id:guid}/tracks")]
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, Guid MediaItemId)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new AddPlaylistTrackCommand
        {
            PlaylistId = id,
            MediaItemId = MediaItemId,
            UserId = userId,
            AddedAt = DateTime.UtcNow
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Thêm bài hát vào playlist thành công!"));
    }

    [HttpDelete("{id:guid}/tracks/{trackId:guid}")]
    public async Task<IActionResult> RemoveTrackFromPlaylist(Guid id, Guid trackId)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new RemovePlaylistTrackCommand
        {
            PlaylistId = id,
            MediaItemId = trackId,
            UserId = userId
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Xóa bài hát khỏi playlist thành công!"));
    }

    [HttpGet]
        public async Task<IActionResult> GetMyPlaylists()
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var query = new ViewPlaylistQuery { OwnerId = userId };

            // 1. Lấy thẳng danh sách DTO từ Mediator
            var MyPlaylistDto = await _mediator.Send(query);

            // 2. Trả thẳng về cho Frontend (Nếu trống, JSON sẽ tự ra data: [])
            return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(MyPlaylistDto, "Lấy danh sách playlist thành công!"));
    }

    [HttpGet("{id:guid}/tracks")]
    public async Task<IActionResult> GetPlaylistTracks(Guid id)
    {
        var query = new GetPlaylistTracksQuery { PlaylistId = id };

        var PlaylistTracks = await _mediator.Send(query);

        // Trả về danh sách bài hát
        return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(PlaylistTracks, "Lấy danh sách bài hát thành công!"));
    }
}