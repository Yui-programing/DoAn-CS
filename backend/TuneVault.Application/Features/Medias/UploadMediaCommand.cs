using MediatR;
using System;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Medias.Commands.UploadMedia;

public class UploadMediaCommand : IRequest<Guid>
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string FilePath { get; set; } = null!;
    public string? CoverUrl { get; set; }
    public int DurationInSeconds { get; set; }
    public MediaType MediaType { get; set; }
    public Guid ArtistId { get; set; }
    public bool IsPrivate { get; set; }
}


