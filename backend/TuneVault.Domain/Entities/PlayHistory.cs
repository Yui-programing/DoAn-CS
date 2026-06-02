namespace TuneVault.Domain.Entities
{
    public class PlayHistory
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = null!;
        public Guid MediaItemId { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}