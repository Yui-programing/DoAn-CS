using TuneVault.Domain.Enums;

namespace TuneVault.Domain.Entities
{
    public class MediaItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string FilePath { get; set; } = null!;
        public string? CoverUrl { get; set; }
        public int DurationInSeconds { get; set; }
        public MediaType MediaType { get; set; }
        public Guid OwnerId { get; set; }
        public Guid? AlbumId { get; set; }
        public Guid? ArtistId { get; set; }
        public string? AlbumName { get; set; }
        public string? ArtistName { get; set; }
        public bool IsPrivate { get; set; }
        public string ApprovalStatus { get; set; } = "Pending"; // Pending, Approved, Rejected
        public int ViewCount { get; set; }
    }
}