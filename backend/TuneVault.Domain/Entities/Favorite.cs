namespace TuneVault.Domain.Entities
{
    public class Favorite
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid MediaItemId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}