namespace TuneVault.Domain.Entities
{
    public class MediaShare
    {
        public Guid Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;

        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }

        public string? Message { get; set; }
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;

        public UserProfile Sender { get; set; } = null!;
        public UserProfile Receiver { get; set; } = null!;
        public MediaItem? MediaItem { get; set; }
        public Playlist? Playlist { get; set; }
    }
}