using MediatR;
using System;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Medias.Queries.GetMediaDetail;

public class GetMediaDetailQuery : IRequest<MediaItem>
{
    public Guid Id { get; set; }
}
