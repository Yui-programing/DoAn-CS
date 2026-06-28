namespace TuneVault.API.Requests
{
    public class UpdatePlaylistRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
    }
}
