using TuneVault.Domain.Enums;

namespace TuneVault.Domain.Entities
{
    public class MediaItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public int DurationInSeconds { get; set; }
        public MediaType MediaType { get; set; }

        public string OwnerId { get; set; } = string.Empty;
        public UserProfile Owner { get; set; } = null!;

        public Guid? AlbumId { get; set; }
        public Album? Album { get; set; }

        public Guid? ArtistId { get; set; }
        public Artist? Artist { get; set; }
    }
}