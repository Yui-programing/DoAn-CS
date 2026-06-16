namespace TuneVault.Domain.Entities
{
    public class Playlist
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OwnerId { get; set; } = null!;
        public int TracksCount { get; set; }
        public int TotalDuration { get; set; }

        public int Type { get; set; } = 0;
    }
}