namespace TuneVault.Domain.Entities
{
    public class UserProfile
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
    }
}