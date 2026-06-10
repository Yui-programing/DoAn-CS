using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Medias.Commands.UploadMedia;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IMediator _mediator;
    private readonly IMediaItemRepository _mediaItemRepository;

    public MediaController(
        ICloudinaryService cloudinaryService,
        IMediator mediator,
        IMediaItemRepository mediaItemRepository)
    {
        _cloudinaryService = cloudinaryService;
        _mediator = mediator;
        _mediaItemRepository = mediaItemRepository;
    }

    private string? GetUserIdFromJwt() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadMedia([FromForm] UploadMediaRequest request)
    {
        var userId = GetUserIdFromJwt();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

        if (request.MediaFile == null || request.MediaFile.Length == 0)
            return BadRequest(ApiResponse<object>.SetFailure(message: "File media không hợp lệ."));

        // 1. Validate định dạng file (whitelist extension/MIME)
        var audioExtensions = new[] { ".mp3", ".wav", ".aac", ".flac" };
        var videoExtensions = new[] { ".mp4", ".webm", ".avi", ".mkv" };
        var fileExtension = Path.GetExtension(request.MediaFile.FileName).ToLower();

        if (request.MediaType == MediaType.Audio && !audioExtensions.Contains(fileExtension))
            return BadRequest(ApiResponse<object>.SetFailure(message: "Định dạng audio không được hỗ trợ."));
        if (request.MediaType == MediaType.Video && !videoExtensions.Contains(fileExtension))
            return BadRequest(ApiResponse<object>.SetFailure(message: "Định dạng video không được hỗ trợ."));

        // 2. Giới hạn kích thước cấu hình (Audio: tối đa 15MB, Video: tối đa 100MB)
        long maxSize = request.MediaType == MediaType.Audio ? 15 * 1024 * 1024 : 100 * 1024 * 1024;
        if (request.MediaFile.Length > maxSize)
            return BadRequest(ApiResponse<object>.SetFailure(message: $"Kích thước file vượt quá giới hạn (Tối đa {maxSize / (1024 * 1024)}MB)."));

        // 3. Tải file media lên Cloudinary
        using var mediaStream = request.MediaFile.OpenReadStream();
        string mediaUrl;
        if (request.MediaType == MediaType.Audio)
        {
            mediaUrl = await _cloudinaryService.UploadAudioAsync(mediaStream, request.MediaFile.FileName, "TuneVault/Songs");
        }
        else
        {
            mediaUrl = await _cloudinaryService.UploadAudioAsync(mediaStream, request.MediaFile.FileName, "TuneVault/Videos");
        }

        // 4. Tải ảnh bìa (coverImage) lên Cloudinary (nếu có)
        string coverUrl = string.Empty;
        if (request.CoverImage != null && request.CoverImage.Length > 0)
        {
            using var coverStream = request.CoverImage.OpenReadStream();
            coverUrl = await _cloudinaryService.UploadImageAsync(coverStream, request.CoverImage.FileName, "TuneVault/Covers");
        }

        // 5. Gán thời gian phát nhạc mặc định
        int duration = 180;

        // 6. Lưu metadata xuống SQL Server thông qua MediatR Command
        var command = new UploadMediaCommand
        {
            Title = request.Title,
            Description = request.Description,
            FilePath = mediaUrl,
            CoverUrl = coverUrl,
            DurationInSeconds = duration,
            MediaType = request.MediaType,
            OwnerId = userId,
            IsPrivate = request.IsPrivate
        };

        Guid mediaId = await _mediator.Send(command);

        return Ok(ApiResponse<Guid>.SetSuccess(mediaId, "Tải lên file media thành công!"));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMediaDetail(Guid id)
    {
        var media = await _mediaItemRepository.GetByIdAsync(id);
        if (media == null)
            return NotFound(ApiResponse<object>.SetFailure(message: "Không tìm thấy media."));

        return Ok(ApiResponse<MediaItem>.SetSuccess(media));
    }

    // API ghi nhận lượt nghe nhạc
    [HttpGet("{id:guid}/stream")]
    [AllowAnonymous] // cho phép mọi người đều có thể stream nhạc kh bắt buộc đăng nhập
    public async Task<IActionResult> StreamMedia(Guid id)
    {
        var media = await _mediaItemRepository.GetByIdAsync(id);
        if (media == null)
            return NotFound(ApiResponse<object>.SetFailure(message: "Không tìm thấy file media."));
        // Chuyển hướng HTTP 302 Redirect trực tiếp sang URL Cloudinary để phát
        return Redirect(media.FilePath);
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
}
