using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class SearchItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;

        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!; // "Song", "Artist", "Playlist"
        public string CoverUrl { get; set; } = null!;
        public string? ArtistName { get; set; }
    }

    public class SuggestionResultDto
    {
        public string Text { get; set; } = null!;
        public string? Type { get; set; }

    }
}
