using MediatR;
using System.Collections.Generic;
using System;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Artists.Queries
{
    public class GetPendingArtistRegistrationsQuery : IRequest<IEnumerable<ArtistRegistration>>
    {
    }
}
