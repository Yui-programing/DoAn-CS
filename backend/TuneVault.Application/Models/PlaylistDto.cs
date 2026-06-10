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
    }   

    
    public class UpdatePlaylistRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public bool IsPublic { get; set; }
    }

    public class MyPlaylistDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public int TracksCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PlaylistTrackDto
    {
        public Guid MediaItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int DurationInSeconds { get; set; }
        public DateTime AddedAt { get; set; } // Ngày bài hát này được đưa vào playlist
    }


}
