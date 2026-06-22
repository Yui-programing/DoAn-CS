namespace TuneVault.Domain.Entities
{
    public class MediaShare
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }
        public Guid? AlbumId { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
        public bool IsAccepted { get; set; }
    }
}