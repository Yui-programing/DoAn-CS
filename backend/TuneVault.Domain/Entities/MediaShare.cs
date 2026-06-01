namespace TuneVault.Domain.Entities
{
    public class MediaShare
    {
        public Guid Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
    }
}