namespace TuneVault.Domain.Entities
{
    public class Follow
    {
        public Guid Id { get; set; }
        public string FollowerId { get; set; } = null!;
        public string? FollowingUserId { get; set; }
        public Guid? FollowingArtistId { get; set; }
        public DateTime FollowedAt { get; set; }
    }
}