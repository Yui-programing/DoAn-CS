namespace TuneVault.Domain.Entities
{
    public class Playlist
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string OwnerId { get; set; } = string.Empty;
        public UserProfile Owner { get; set; } = null!;

        public ICollection<PlaylistTrack> Tracks { get; set; } = new List<PlaylistTrack>();
    }
}