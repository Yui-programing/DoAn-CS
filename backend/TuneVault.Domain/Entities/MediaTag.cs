using System;

namespace TuneVault.Domain.Entities
{
    public class MediaTag
    {
        public Guid MediaItemId { get; set; }
        public string TagId { get; set; }
        public DateTime TaggedAt { get; set; }
    }
}