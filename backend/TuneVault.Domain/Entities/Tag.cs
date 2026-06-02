using System;

namespace TuneVault.Domain.Entities
{
    public class Tag
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}