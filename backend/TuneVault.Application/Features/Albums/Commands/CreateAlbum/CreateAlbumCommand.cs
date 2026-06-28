using MediatR;
using System;
using System.Collections.Generic;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum
{
    public class CreateAlbumCommand : IRequest<Guid>
    {
        public Guid ArtistId { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public DateTime ReleaseDate { get; set; }
        public List<Guid> TrackIds { get; set; } = new List<Guid>();
    }
}
