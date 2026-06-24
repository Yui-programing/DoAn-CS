using MediatR;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Medias.Commands.UploadMedia;

public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, Guid>
{
    private readonly IMediaItemRepository _mediaItemRepository;
    private readonly ICloudinaryService _cloudinaryService;

    public UploadMediaCommandHandler(
        IMediaItemRepository mediaItemRepository,
        ICloudinaryService cloudinaryService)
    {
        _mediaItemRepository = mediaItemRepository;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<Guid> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        if (request.MediaStream == null || request.MediaStream.Length == 0)
        {
            throw new FluentValidation.ValidationException("File media không hợp lệ.");
        }

        // 1. Validate định dạng file (whitelist extension/MIME)
        var audioExtensions = new[] { ".mp3", ".wav", ".aac", ".flac" };
        var videoExtensions = new[] { ".mp4", ".webm", ".avi", ".mkv" };
        var fileExtension = Path.GetExtension(request.MediaFileName).ToLower();

        if (request.MediaType == MediaType.Audio && !audioExtensions.Contains(fileExtension))
        {
            throw new FluentValidation.ValidationException("Định dạng audio không được hỗ trợ.");
        }
        if (request.MediaType == MediaType.Video && !videoExtensions.Contains(fileExtension))
        {
            throw new FluentValidation.ValidationException("Định dạng video không được hỗ trợ.");
        }

        // 2. Giới hạn kích thước cấu hình (Audio: tối đa 15MB, Video: tối đa 100MB)
        long maxSize = request.MediaType == MediaType.Audio ? 15 * 1024 * 1024 : 100 * 1024 * 1024;
        if (request.MediaStream.Length > maxSize)
        {
            throw new FluentValidation.ValidationException($"Kích thước file vượt quá giới hạn (Tối đa {maxSize / (1024 * 1024)}MB).");
        }

        // 3. Tải file media lên Cloudinary
        string mediaUrl;
        if (request.MediaType == MediaType.Audio)
        {
            mediaUrl = await _cloudinaryService.UploadAudioAsync(request.MediaStream, request.MediaFileName, "TuneVault/Songs");
        }
        else
        {
            mediaUrl = await _cloudinaryService.UploadAudioAsync(request.MediaStream, request.MediaFileName, "TuneVault/Videos");
        }

        // 4. Tải ảnh bìa (coverImage) lên Cloudinary (nếu có)
        string coverUrl = string.Empty;
        if (request.CoverStream != null && request.CoverStream.Length > 0 && !string.IsNullOrEmpty(request.CoverFileName))
        {
            coverUrl = await _cloudinaryService.UploadImageAsync(request.CoverStream, request.CoverFileName, "TuneVault/Covers");
        }

        // 5. Gán thời gian phát nhạc lấy từ Client (nếu client không gửi thì mặc định 180s)
        int duration = request.DurationInSeconds > 0 ? request.DurationInSeconds : 180;

        var mediaItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            FilePath = mediaUrl,
            CoverUrl = coverUrl,
            DurationInSeconds = duration,
            MediaType = request.MediaType,
            AlbumId = null,
            ArtistId = request.ArtistId,
            IsPrivate = request.IsPrivate,
            ViewCount = 0
        };

        await _mediaItemRepository.AddAsync(mediaItem);
        return mediaItem.Id;
    }
}
