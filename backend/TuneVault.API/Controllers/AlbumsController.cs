using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var artistId))
                {
                    return Unauthorized(new { Success = false, Message = "Không xác định được danh tính nghệ sĩ." });
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

                return Ok(new { Success = true, Message = "Tạo album thành công.", Data = albumId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tạo album.", Error = ex.Message });
            }
        }

        [HttpGet("artist/{artistId}")]
        public async Task<IActionResult> GetAlbumsByArtist(Guid artistId)
        {
            try
            {
                var albums = await _albumRepository.GetAlbumsByArtistIdAsync(artistId);
                return Ok(new { Success = true, Data = albums });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "Đã xảy ra lỗi khi tải danh sách album.", Error = ex.Message });
            }
        }
    }
}
