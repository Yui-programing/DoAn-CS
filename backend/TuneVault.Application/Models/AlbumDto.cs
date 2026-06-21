using System;

namespace TuneVault.Application.Models
{
    public class AlbumDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public DateTime ReleaseDate { get; set; }
        public Guid? ArtistId { get; set; }
        public string? ArtistName { get; set; }
    }
}
