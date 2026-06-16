using MediatR;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries
{
    public class GetPendingMediasQuery : IRequest<IEnumerable<MediaItem>>
    {
    }
}
