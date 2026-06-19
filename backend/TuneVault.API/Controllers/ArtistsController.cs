using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Artists.Commands;
using TuneVault.Application.Repositories;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Artist")]
    public class ArtistsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICloudinaryService _cloudinaryService;

        public ArtistsController(IMediator mediator, ICloudinaryService cloudinaryService)
        {
            _mediator = mediator;
            _cloudinaryService = cloudinaryService;
        }

        [HttpPut("banner")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadBanner(IFormFile file)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var artistId))
                return Unauthorized(ApiResponse<bool>.SetFailure(new List<string> { "Token không hợp lệ." }, "Xác thực thất bại"));

            if (file == null || file.Length == 0)
                return BadRequest(ApiResponse<bool>.SetFailure(new List<string> { "Vui lòng tải lên ảnh bìa." }, "Thiếu file"));

            string url;
            using (var stream = file.OpenReadStream())
            {
                url = await _cloudinaryService.UploadImageAsync(stream, file.FileName, "TuneVault/Banners");
            }

            var command = new UpdateArtistBannerCommand
            {
                ArtistId = artistId,
                BannerUrl = url
            };

            var result = await _mediator.Send(command);

            if (result)
            {
                return Ok(ApiResponse<string>.SetSuccess(url, "Cập nhật ảnh bìa thành công!"));
            }

            return BadRequest(ApiResponse<bool>.SetFailure(new List<string> { "Không thể cập nhật ảnh bìa vào cơ sở dữ liệu." }, "Lỗi cập nhật"));
        }
    }
}
