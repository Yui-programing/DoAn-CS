using MediatR;
using System;

namespace TuneVault.Application.Features.Medias.Queries.StreamMedia;

public class StreamMediaQuery : IRequest<StreamMediaResult>
{
    public Guid Id { get; set; }
}

public class StreamMediaResult
{
    public bool IsRedirect { get; set; }
    public string? RedirectUrl { get; set; }
    public string? FilePath { get; set; }
    public string? ContentType { get; set; }
}
