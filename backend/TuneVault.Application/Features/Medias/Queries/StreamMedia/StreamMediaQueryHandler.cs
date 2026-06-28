using MediatR;
using System;
using System.IO;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Medias.Queries.StreamMedia;

public class StreamMediaQueryHandler : IRequestHandler<StreamMediaQuery, StreamMediaResult>
{
    private readonly IMediaItemRepository _mediaItemRepository;

    public StreamMediaQueryHandler(IMediaItemRepository mediaItemRepository)
    {
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<StreamMediaResult> Handle(StreamMediaQuery request, CancellationToken cancellationToken)
    {
        var media = await _mediaItemRepository.GetByIdAsync(request.Id);
        if (media == null)
        {
            throw new KeyNotFoundException("Không tìm thấy file media.");
        }

        // Nếu là URL tuyệt đối (trên mây như Cloudinary) thì redirect
        if (media.FilePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            media.FilePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            // Fix lỗi ASP.NET Core không cho phép ký tự tiếng Việt (Non-ASCII) trong Header Location
            var encodedUrl = new Uri(media.FilePath).AbsoluteUri;
            return new StreamMediaResult
            {
                IsRedirect = true,
                RedirectUrl = encodedUrl
            };
        }

        // Nếu là đường dẫn cục bộ (ví dụ: /media/react.mp4)
        var relativePath = media.FilePath.TrimStart('/');
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

        // Dự phòng: Tìm ở thư mục frontend public/media nếu đang ở môi trường chạy dev
        if (!File.Exists(filePath))
        {
            var parentDir = Directory.GetParent(Directory.GetCurrentDirectory())?.FullName;
            if (parentDir != null)
            {
                filePath = Path.Combine(parentDir, "frontend", "public", relativePath);
            }
        }

        if (!File.Exists(filePath))
        {
            throw new KeyNotFoundException($"Không tìm thấy file vật lý tại {filePath}.");
        }

        // Xác định Content-Type
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        var contentType = extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            _ => "application/octet-stream"
        };

        return new StreamMediaResult
        {
            IsRedirect = false,
            FilePath = filePath,
            ContentType = contentType
        };
    }
}
