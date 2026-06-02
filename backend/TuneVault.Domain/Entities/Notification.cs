using TuneVault.Domain.Enums;

namespace TuneVault.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = null!;
        public NotificationType Type { get; set; }
        public string PayloadJson { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}