using System;

namespace TuneVault.Domain.Entities
{
    public class Artist
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Genres { get; set; }
        public string? BannerUrl { get; set; }
        public DateTime? VerifiedAt { get; set; }
    }
}
