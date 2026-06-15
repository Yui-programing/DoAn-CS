using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class CreatePlaylistRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public int Type { get; set; } = 0; // 0: Playlist, 1: Album
    }   
    public class AddPlaylistTrackRequest
    {
        public Guid MediaItemId { get; set; }
    }


    public class UpdatePlaylistRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public int Type { get; set; } = 0; // 0: Playlist, 1: Album
    }

    public class MyPlaylistDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public int TracksCount { get; set; }
        public int Type { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PlaylistTrackDto
    {
        public Guid MediaItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ArtistName { get; set; }
        public string? CoverUrl { get; set; }
        public int DurationInSeconds { get; set; }
        public DateTime AddedAt { get; set; } // Ngày bài hát này được đưa vào playlist
    }


}
