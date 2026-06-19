namespace TuneVault.Domain.Entities
{
    public class Follow
    {
        public Guid Id { get; set; }
        public Guid FollowerId { get; set; }
        public Guid? FollowingUserId { get; set; }

        public DateTime FollowedAt { get; set; }
    }
}