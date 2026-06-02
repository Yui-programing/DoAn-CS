namespace TuneVault.Domain.Entities
{
    public class UserProfile
    {
        public string Id { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public User? User { get; set; }
    }
}