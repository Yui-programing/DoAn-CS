using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetMediaDetail;

public class GetMediaDetailQueryHandler : IRequestHandler<GetMediaDetailQuery, MediaItem>
{
    private readonly IMediaItemRepository _mediaItemRepository;

    public GetMediaDetailQueryHandler(IMediaItemRepository mediaItemRepository)
    {
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<MediaItem> Handle(GetMediaDetailQuery request, CancellationToken cancellationToken)
    {
        var media = await _mediaItemRepository.GetByIdAsync(request.Id);
        if (media == null)
        {
            throw new KeyNotFoundException("Không tìm thấy media.");
        }
        return media;
    }
}
