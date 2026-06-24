using MediatR;
using System;
using System.IO;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Medias.Commands.UploadMedia;

public class UploadMediaCommand : IRequest<Guid>
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public Stream MediaStream { get; set; } = null!;
    public string MediaFileName { get; set; } = null!;
    public Stream? CoverStream { get; set; }
    public string? CoverFileName { get; set; }
    public int DurationInSeconds { get; set; }
    public MediaType MediaType { get; set; }
    public Guid ArtistId { get; set; }
    public bool IsPrivate { get; set; }
}


