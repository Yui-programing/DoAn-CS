using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Medias.Commands.UploadMedia;
using TuneVault.Application.Features.Medias.Commands.UploadImage;
using TuneVault.Application.Features.Medias.Queries.GetMyMedia;
using TuneVault.Application.Features.Medias.Queries.GetMediaDetail;
using TuneVault.Application.Features.Medias.Queries.StreamMedia;
using TuneVault.Application.Features.Medias.Queries.GetArtistMedia;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly IMediator _mediator;

    public MediaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserIdFromJwt()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId)) return userId;
        return Guid.Empty;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles = "Artist")]
    public async Task<IActionResult> UploadMedia([FromForm] UploadMediaRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        if (request.MediaFile == null || request.MediaFile.Length == 0)
            return BadRequest(ApiResponse<object>.SetFailure(message: "File media không hợp lệ."));

        // Mở stream và chuyển thông tin tệp sang Command
        using var mediaStream = request.MediaFile.OpenReadStream();
        Stream? coverStream = null;
        if (request.CoverImage != null && request.CoverImage.Length > 0)
        {
            coverStream = request.CoverImage.OpenReadStream();
        }

        try
        {
            var command = new UploadMediaCommand
            {
                Title = request.Title,
                Description = request.Description,
                MediaStream = mediaStream,
                MediaFileName = request.MediaFile.FileName,
                CoverStream = coverStream,
                CoverFileName = request.CoverImage?.FileName,
                DurationInSeconds = request.Duration,
                MediaType = request.MediaType,
                ArtistId = userId,
                IsPrivate = request.IsPrivate
            };

            Guid mediaId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.SetSuccess(mediaId, "Tải lên file media thành công!"));
        }
        finally
        {
            coverStream?.Dispose();
        }
    }

    [HttpPost("upload-image")]
    [Consumes("multipart/form-data")]
    [Authorize]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.SetFailure(message: "File ảnh không hợp lệ."));

        using var stream = file.OpenReadStream();
        var command = new UploadImageCommand
        {
            ImageStream = stream,
            FileName = file.FileName,
            FolderName = "TuneVault/Covers"
        };

        var url = await _mediator.Send(command);
        return Ok(ApiResponse<string>.SetSuccess(url, "Tải ảnh lên thành công."));
    }

    [HttpGet("my-media")]
    [Authorize(Roles = "Artist")]
    public async Task<IActionResult> GetMyMedia()
    {
        var userId = GetUserIdFromJwt();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        var query = new GetMyMediaQuery { ArtistId = userId };
        var mediaItems = await _mediator.Send(query);
        return Ok(ApiResponse<IEnumerable<MediaItem>>.SetSuccess(mediaItems, "Lấy danh sách media của tôi thành công."));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMediaDetail(Guid id)
    {
        var query = new GetMediaDetailQuery { Id = id };
        var media = await _mediator.Send(query);
        return Ok(ApiResponse<MediaItem>.SetSuccess(media));
    }

    // API ghi nhận lượt nghe nhạc
    [HttpGet("{id:guid}/stream")]
    [AllowAnonymous] // cho phép mọi người đều có thể stream nhạc kh bắt buộc đăng nhập
    public async Task<IActionResult> StreamMedia(Guid id)
    {
        var query = new StreamMediaQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result.IsRedirect)
        {
            return Redirect(result.RedirectUrl!);
        }

        // Bật enableRangeProcessing = true để hỗ trợ Range header phát video/audio từ file stream cục bộ
        var fileStream = new FileStream(result.FilePath!, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(fileStream, result.ContentType!, enableRangeProcessing: true);
    }

    [HttpGet("artist/{artistId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArtistMedia(Guid artistId)
    {
        var query = new GetArtistMediaQuery { ArtistId = artistId };
        var publicApprovedMedia = await _mediator.Send(query);
        return Ok(ApiResponse<IEnumerable<MediaItem>>.SetSuccess(publicApprovedMedia, "Lấy danh sách tác phẩm của nghệ sĩ thành công."));
    }
}

public class UploadMediaRequest
{
    public IFormFile MediaFile { get; set; } = null!;
    public IFormFile? CoverImage { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public MediaType MediaType { get; set; }
    public bool IsPrivate { get; set; }
    public int Duration { get; set; } // Thời lượng tính bằng giây do frontend gửi lên
}
