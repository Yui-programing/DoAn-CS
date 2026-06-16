using System;

namespace TuneVault.Domain.Entities
{
    public class ArtistRegistration
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; } = null!; // FK to User.Id
        public string StageName { get; set; } = null!;
        public string? Genres { get; set; }
        public string IdCardUrl { get; set; } = null!; // Cloudinary URL
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
    }
}
