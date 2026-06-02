namespace TuneVault.Domain.Entities
{
    public class MediaShare
    {
        public Guid Id { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
    }
}