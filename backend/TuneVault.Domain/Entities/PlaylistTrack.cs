namespace TuneVault.Domain.Entities
{
    public class PlaylistTrack
    {
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }

        public String UserId { get; set; } = null!;
        public DateTime AddedAt { get; set; }
    }
}