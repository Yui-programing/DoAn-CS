using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetArtistMedia;

public class GetArtistMediaQuery : IRequest<IEnumerable<MediaItem>>
{
    public Guid ArtistId { get; set; }
}
