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
using TuneVault.Domain.Entities;

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
    public async Task<IActionResult> Create([FromBody] CreatePlaylistCommand command)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        command.OwnerId = userId;

        Guid playlistId = await _mediator.Send(command);

        // Sử dụng SetSuccess theo file ApiResponse của bạn
        return Ok(ApiResponse<Guid>.SetSuccess(playlistId, "Tạo playlist thành công!"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistCommand command)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        command.Id = id;
        command.OwnerId = userId;

        Guid updatedId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(updatedId, "Cập nhật playlist thành công!"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new DeletePlaylistCommand { Id = id, OwnerId = userId };

        Guid deletedId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(deletedId, "Xóa playlist thành công!"));
    }

    

    [HttpPost("{id:guid}/tracks")]
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, [FromBody] AddPlaylistTrackCommand command)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        command.PlaylistId = id;
        command.UserId = userId;

        Guid playlistTrackId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(playlistTrackId, "Thêm bài hát vào playlist thành công!"));
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

        Guid removedTrackId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(removedTrackId, "Xóa bài hát khỏi playlist thành công!"));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var query = new ViewPlaylistQuery { OwnerId = userId };

        // 1. Nhận lại danh sách Entity gốc từ tầng Application
        IEnumerable<MyPlaylistDto> playlists = await _mediator.Send(query);

        // 2. Kiểm tra nếu trống thì trả về mảng rỗng kèm thông báo luôn (như yêu cầu trước)
        if (playlists == null || !playlists.Any())
        {
            return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(
                new List<MyPlaylistDto>(),
                "Bạn chưa có playlist nào hoặc danh sách trống."));
        }

        // 3. MAP NGƯỢC: Tiến hành map từ Entity sang DTO ngay tại Controller
        var playlistDtos = playlists.Select(entity => new MyPlaylistDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            TracksCount = entity.TracksCount
        });

        // 4. Trả DTO về cho Frontend
        return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(playlistDtos, "Lấy danh sách thành công!"));
    }

    [HttpGet("{id:guid}/tracks")]
    public async Task<IActionResult> GetPlaylistTracks(Guid id)
    {
        var query = new GetPlaylistTracksQuery { PlaylistId = id };

        IEnumerable<PlaylistTrackDto> tracks = await _mediator.Send(query);

        // Nếu playlist không có bài hát nào (trống)
        if (tracks == null || !tracks.Any())
        {
            return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(
                new List<PlaylistTrackDto>(),
                "Playlist này hiện chưa có bài hát nào."));
        }

        // Trả về danh sách bài hát
        return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(tracks, "Lấy danh sách bài hát thành công!"));
    }
}