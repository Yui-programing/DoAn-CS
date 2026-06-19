using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.API.Common;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlbumsController : ControllerBase
    {
        private readonly IAlbumRepository _albumRepository;

        public AlbumsController(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
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

            var album = new Album
            {
                Title = dto.Title,
                CoverImageUrl = dto.CoverImageUrl,
                ReleaseDate = dto.ReleaseDate,
                ArtistId = artistId
            };

            var albumId = await _albumRepository.CreateAlbumAsync(album);

            if (dto.TrackIds != null && dto.TrackIds.Count > 0)
            {
                await _albumRepository.UpdateMediaItemsAlbumAsync(albumId, album.Title, dto.TrackIds, artistId);
            }

            return Ok(ApiResponse<Guid>.SetSuccess(albumId, "Tạo album thành công."));
        }

        [HttpGet("artist/{artistId}")]
        public async Task<IActionResult> GetAlbumsByArtist(Guid artistId)
        {
            var albums = await _albumRepository.GetAlbumsByArtistIdAsync(artistId);
            return Ok(ApiResponse<IEnumerable<AlbumDto>>.SetSuccess(albums, "Lấy danh sách album của nghệ sĩ thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAlbumById(Guid id)
        {
            var album = await _albumRepository.GetAlbumByIdAsync(id);
            if (album == null)
            {
                throw new KeyNotFoundException("Không tìm thấy album.");
            }
            return Ok(ApiResponse<AlbumDto>.SetSuccess(album, "Lấy thông tin album thành công."));
        }

        [HttpGet("{id}/tracks")]
        public async Task<IActionResult> GetAlbumTracks(Guid id)
        {
            var tracks = await _albumRepository.GetTracksByAlbumIdAsync(id);
            return Ok(ApiResponse<IEnumerable<PlaylistTrackDto>>.SetSuccess(tracks, "Lấy danh sách bài hát của album thành công."));
        }
    }
}
