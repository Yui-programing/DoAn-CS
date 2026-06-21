namespace TuneVault.Domain.Entities
{
    public class UserProfile
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public bool IsPublic { get; set; } = true;
        public User? User { get; set; }
    }
}