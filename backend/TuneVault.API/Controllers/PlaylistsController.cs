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
using TuneVault.Application.Features.Playlists.Queries.GetPublicPlaylistsByUser;
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

    private Guid GetUserIdFromJwt()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId)) return userId;
        return Guid.Empty;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new CreatePlaylistCommand
        {
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = userId
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Tạo playlist thành công!"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

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
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new DeletePlaylistCommand { Id = id, OwnerId = userId };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Xóa playlist thành công!"));
    }

    [HttpPost("{id:guid}/tracks")]
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, [FromBody] AddPlaylistTrackRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var command = new AddPlaylistTrackCommand
        {
            PlaylistId = id,
            MediaItemId = request.MediaItemId,
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
        if (userId == Guid.Empty)
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
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var query = new ViewPlaylistQuery { OwnerId = userId };

        var myPlaylists = await _mediator.Send(query);

        return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(myPlaylists, "Lấy danh sách playlist thành công!"));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlaylistById(Guid id)
    {
        var query = new TuneVault.Application.Features.Playlists.Queries.GetPlaylistById.GetPlaylistByIdQuery
        {
            PlaylistId = id,
            UserId = GetUserIdFromJwt()
        };

        var playlist = await _mediator.Send(query);

        if (playlist == null)
            return NotFound(ApiResponse<object>.SetFailure(message: "Không tìm thấy playlist."));

        return Ok(ApiResponse<MyPlaylistDto>.SetSuccess(playlist, "Lấy playlist thành công!"));
    }

    [AllowAnonymous]
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetPublicPlaylistsByUser(Guid userId)
    {
        var query = new GetPublicPlaylistsByUserQuery
        {
            UserId = userId
        };

        var playlists = await _mediator.Send(query);

        return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(playlists, "Lấy danh sách playlist công khai thành công!"));
    }

    [HttpGet("{id:guid}/tracks")]
    public async Task<IActionResult> GetPlaylistTracks(Guid id)
    {
        var query = new GetPlaylistTracksQuery { PlaylistId = id, UserId = GetUserIdFromJwt() };

        var playlistTracks = await _mediator.Send(query);

        return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(playlistTracks, "Lấy danh sách bài hát thành công!"));
    }
}