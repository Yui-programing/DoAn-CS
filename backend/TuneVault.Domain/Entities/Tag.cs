using System;

namespace TuneVault.Domain.Entities
{
    public class Tag
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }
}