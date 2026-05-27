namespace TuneVault.Domain.Entities
{
    public class Album
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public DateTime ReleaseDate { get; set; }

        public Guid ArtistId { get; set; }
        public Artist Artist { get; set; } = null!;

        public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
    }
}