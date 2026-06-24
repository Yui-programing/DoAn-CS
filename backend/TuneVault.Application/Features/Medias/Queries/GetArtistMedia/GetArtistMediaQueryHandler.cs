using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetArtistMedia;

public class GetArtistMediaQueryHandler : IRequestHandler<GetArtistMediaQuery, IEnumerable<MediaItem>>
{
    private readonly IMediaItemRepository _mediaItemRepository;

    public GetArtistMediaQueryHandler(IMediaItemRepository mediaItemRepository)
    {
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<IEnumerable<MediaItem>> Handle(GetArtistMediaQuery request, CancellationToken cancellationToken)
    {
        var mediaItems = await _mediaItemRepository.GetByArtistIdAsync(request.ArtistId);
        return mediaItems.Where(m => m.ApprovalStatus == "Approved" && !m.IsPrivate);
    }
}
