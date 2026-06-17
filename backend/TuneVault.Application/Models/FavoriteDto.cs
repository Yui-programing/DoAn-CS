using System;

namespace TuneVault.Application.Models
{
    public class FavoriteDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = null!;
        public Guid MediaItemId { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Thông tin phụ của MediaItem
        public string MediaTitle { get; set; } = null!;
        public string? CoverUrl { get; set; }
        public string? ArtistName { get; set; }
        public int DurationInSeconds { get; set; }
        public int MediaType { get; set; }
    }
}
