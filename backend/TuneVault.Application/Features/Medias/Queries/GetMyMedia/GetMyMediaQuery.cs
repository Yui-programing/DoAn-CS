using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetMyMedia;

public class GetMyMediaQuery : IRequest<IEnumerable<MediaItem>>
{
    public Guid ArtistId { get; set; }
}
