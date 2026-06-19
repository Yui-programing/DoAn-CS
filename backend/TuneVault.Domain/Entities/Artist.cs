using System;

namespace TuneVault.Domain.Entities
{
    public class Artist
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
