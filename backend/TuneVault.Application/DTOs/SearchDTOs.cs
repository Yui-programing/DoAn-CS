using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.DTOs
{
    public class SearchItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!; // "Song", "Artist", "Playlist"
        public string ImageUrl { get; set; } = null!;
    }

    public class QuickSearchResultDto
    {
        public IEnumerable<SearchItemDto> TopSongs { get; set; } = new List<SearchItemDto>();
        public IEnumerable<SearchItemDto> TopArtists { get; set; } = new List<SearchItemDto>();
        public IEnumerable<SearchItemDto> TopPlaylists { get; set; } = new List<SearchItemDto>();
    }
}
