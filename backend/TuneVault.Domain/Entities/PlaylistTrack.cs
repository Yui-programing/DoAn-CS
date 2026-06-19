namespace TuneVault.Domain.Entities
{
    public class PlaylistTrack
    {
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }

        public Guid UserId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}