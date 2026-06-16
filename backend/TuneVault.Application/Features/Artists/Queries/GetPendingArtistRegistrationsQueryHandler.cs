using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Artists.Queries
{
    public class GetPendingArtistRegistrationsQueryHandler : IRequestHandler<GetPendingArtistRegistrationsQuery, IEnumerable<ArtistRegistration>>
    {
        private readonly IArtistRegistrationRepository _repo;

        public GetPendingArtistRegistrationsQueryHandler(IArtistRegistrationRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ArtistRegistration>> Handle(GetPendingArtistRegistrationsQuery request, CancellationToken cancellationToken)
        {
            return await _repo.GetPendingAsync();
        }
    }
}
