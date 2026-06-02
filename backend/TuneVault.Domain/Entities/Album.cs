namespace TuneVault.Domain.Entities
{
    public class Album
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public DateTime ReleaseDate { get; set; }
        public Guid? ArtistId { get; set; }
    }
}