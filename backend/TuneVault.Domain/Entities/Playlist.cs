namespace TuneVault.Domain.Entities
{
    public class Playlist
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OwnerId { get; set; }
        public int TracksCount { get; set; }
        public int TotalDuration { get; set; }
    }
}