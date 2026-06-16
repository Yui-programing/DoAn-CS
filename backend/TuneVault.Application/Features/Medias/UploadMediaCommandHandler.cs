using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Commands.UploadMedia;

public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, Guid>
{
    private readonly IMediaItemRepository _mediaItemRepository;

    public UploadMediaCommandHandler(IMediaItemRepository mediaItemRepository)
    {
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<Guid> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        var mediaItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            FilePath = request.FilePath,
            CoverUrl = request.CoverUrl,
            DurationInSeconds = request.DurationInSeconds,
            MediaType = request.MediaType,
            OwnerId = request.OwnerId,
            AlbumId = null,
            ArtistId = null,
            AlbumName = request.AlbumName,
            ArtistName = request.ArtistName,
            IsPrivate = request.IsPrivate,
            ViewCount = 0
        };

        await _mediaItemRepository.AddAsync(mediaItem);
        return mediaItem.Id;
    }
}
