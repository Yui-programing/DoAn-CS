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

    // H�m helper r�t nhanh UserId t? JWT Token
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
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

        var command = new CreatePlaylistCommand
        {
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = userId
        };

        var result = await _mediator.Send(command);

        // S? d?ng SetSuccess theo file ApiResponse c?a b?n
        return Ok(ApiResponse<Guid>.SetSuccess(result, "T?o playlist th�nh c�ng!"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

        // �?m b?o ID du?c l?y t? URL v� g�n v�o request
        var command = new UpdatePlaylistCommand
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = userId
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "C?p nh?t playlist th�nh c�ng!"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

        var command = new DeletePlaylistCommand { Id = id, OwnerId = userId };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "X�a playlist th�nh c�ng!"));
    }

    

    [HttpPost("{id:guid}/tracks")]
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, [FromBody] AddPlaylistTrackRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

        var command = new AddPlaylistTrackCommand
        {
            PlaylistId = id,
            MediaItemId = request.MediaItemId,
            UserId = userId,
            AddedAt = DateTime.UtcNow
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "Th�m b�i h�t v�o playlist th�nh c�ng!"));
    }

    [HttpDelete("{id:guid}/tracks/{trackId:guid}")]
    public async Task<IActionResult> RemoveTrackFromPlaylist(Guid id, Guid trackId)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

        var command = new RemovePlaylistTrackCommand
        {
            PlaylistId = id,
            MediaItemId = trackId,
            UserId = userId
        };

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(result, "X�a b�i h�t kh?i playlist th�nh c�ng!"));
    }

    [HttpGet]
        public async Task<IActionResult> GetMyPlaylists()
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token kh�ng h?p l?."));

            var query = new ViewPlaylistQuery { OwnerId = userId };

            // 1. L?y th?ng danh s�ch DTO t? Mediator
            var MyPlaylistDto = await _mediator.Send(query);

            // 2. Tr? th?ng v? cho Frontend (N?u tr?ng, JSON s? t? ra data: [])
            return Ok(ApiResponse<IEnumerable<MyPlaylistDto>>.SetSuccess(MyPlaylistDto, "L?y danh s�ch playlist th�nh c�ng!"));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlaylistById(Guid id)
    {
        var query = new TuneVault.Application.Features.Playlists.Queries.GetPlaylistById.GetPlaylistByIdQuery { PlaylistId = id, UserId = GetUserIdFromJwt() };
        var playlist = await _mediator.Send(query);
        if (playlist == null) return NotFound(ApiResponse<object>.SetFailure(message: "Khong tim thay playlist"));
        return Ok(ApiResponse<MyPlaylistDto>.SetSuccess(playlist, "Lay playlist thanh cong!"));
    }
    [HttpGet("{id:guid}/tracks")]
    public async Task<IActionResult> GetPlaylistTracks(Guid id)
    {
        var query = new GetPlaylistTracksQuery { PlaylistId = id, UserId = GetUserIdFromJwt() };

        var PlaylistTracks = await _mediator.Send(query);

        // Tr? v? danh s�ch b�i h�t
        return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(PlaylistTracks, "L?y danh s�ch b�i h�t th�nh c�ng!"));
    }
}



