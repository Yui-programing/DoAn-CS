using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries
{
    public class GetPendingMediasQueryHandler : IRequestHandler<GetPendingMediasQuery, IEnumerable<MediaItem>>
    {
        private readonly IMediaItemRepository _mediaRepo;

        public GetPendingMediasQueryHandler(IMediaItemRepository mediaRepo)
        {
            _mediaRepo = mediaRepo;
        }

        public async Task<IEnumerable<MediaItem>> Handle(GetPendingMediasQuery request, CancellationToken cancellationToken)
        {
            return await _mediaRepo.GetPendingMediaItemsAsync();
        }
    }
}
