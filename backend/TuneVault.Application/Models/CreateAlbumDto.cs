using System;
using System.Collections.Generic;

namespace TuneVault.Application.Models
{
    public class CreateAlbumDto
    {
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public DateTime ReleaseDate { get; set; }
        public List<Guid> TrackIds { get; set; } = new List<Guid>();
    }
}
