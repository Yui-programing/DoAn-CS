using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.History;

public class PlayHistoryResultDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public Guid MediaItemId { get; set; }
    public DateTime PlayedAt { get; set; }

    public PlayHistoryMediaItemDto MediaItem { get; set; } = null!;
}

public class PlayHistoryMediaItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? ArtistName { get; set; }
    public string? CoverUrl { get; set; }
    public string FilePath { get; set; } = null!;
    public int DurationInSeconds { get; set; }
    public int ViewCount { get; set; }
    public MediaType MediaType { get; set; }
}

public class GetPlayHistoryQuery : IRequest<IEnumerable<PlayHistoryResultDto>>
{
    public string UserId { get; set; } = null!;
    public int Limit { get; set; } = 20;
}
