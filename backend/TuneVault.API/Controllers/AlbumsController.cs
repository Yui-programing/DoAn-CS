using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.API.Common;
using TuneVault.Application.Models;
using TuneVault.Application.Features.Albums.Commands.CreateAlbum;
using TuneVault.Application.Features.Albums.Queries.GetAlbumsByArtist;
using TuneVault.Application.Features.Albums.Queries.GetAlbumById;
using TuneVault.Application.Features.Albums.Queries.GetAlbumTracks;

namespace TuneVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlbumsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AlbumsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize(Roles = "Artist")]
        public async Task<IActionResult> CreateAlbum([FromBody] CreateAlbumDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var artistId))
            {
                throw new UnauthorizedAccessException("Không xác định được danh tính nghệ sĩ.");
            }

            var command = new CreateAlbumCommand
            {
                ArtistId = artistId,
                Title = dto.Title,
                CoverImageUrl = dto.CoverImageUrl,
                ReleaseDate = dto.ReleaseDate,
                TrackIds = dto.TrackIds
            };

            var albumId = await _mediator.Send(command);

            return Ok(ApiResponse<Guid>.SetSuccess(albumId, "Tạo album thành công."));
        }

        [HttpGet("artist/{artistId}")]
        public async Task<IActionResult> GetAlbumsByArtist(Guid artistId)
        {
            var query = new GetAlbumsByArtistQuery { ArtistId = artistId };
            var albums = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<AlbumDto>>.SetSuccess(albums, "Lấy danh sách album của nghệ sĩ thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAlbumById(Guid id)
        {
            var query = new GetAlbumByIdQuery { AlbumId = id };
            var album = await _mediator.Send(query);
            if (album == null)
            {
                throw new KeyNotFoundException("Không tìm thấy album.");
            }
            return Ok(ApiResponse<AlbumDto>.SetSuccess(album, "Lấy thông tin album thành công."));
        }

        [HttpGet("{id}/tracks")]
        public async Task<IActionResult> GetAlbumTracks(Guid id)
        {
            var query = new GetAlbumTracksQuery { AlbumId = id };
            var tracks = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(tracks, "Lấy danh sách bài hát của album thành công."));
        }
    }
}
