namespace TuneVault.Domain.Entities
{
    public class Artist
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        public ICollection<Album> Albums { get; set; } = new List<Album>();
        public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
    }
}