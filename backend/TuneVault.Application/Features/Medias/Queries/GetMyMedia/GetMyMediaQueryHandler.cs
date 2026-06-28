using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetMyMedia;

public class GetMyMediaQueryHandler : IRequestHandler<GetMyMediaQuery, IEnumerable<MediaItem>>
{
    private readonly IMediaItemRepository _mediaItemRepository;

    public GetMyMediaQueryHandler(IMediaItemRepository mediaItemRepository)
    {
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<IEnumerable<MediaItem>> Handle(GetMyMediaQuery request, CancellationToken cancellationToken)
    {
        return await _mediaItemRepository.GetByArtistIdAsync(request.ArtistId);
    }
}
