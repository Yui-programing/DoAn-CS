namespace TuneVault.Domain.Entities
{
    public class UserProfile
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }

        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
        public ICollection<MediaItem> UploadedMedias { get; set; } = new List<MediaItem>();
    }
}