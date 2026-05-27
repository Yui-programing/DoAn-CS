namespace TuneVault.Domain.Entities
{
    public class Follow
    {
        public Guid Id { get; set; }
        public string FollowerId { get; set; } = string.Empty;

        public string? FollowingUserId { get; set; }
        public Guid? FollowingArtistId { get; set; }

        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;

        public UserProfile Follower { get; set; } = null!;
        public UserProfile? FollowingUser { get; set; }
        public Artist? FollowingArtist { get; set; }
    }
}