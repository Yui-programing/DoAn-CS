using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class PlaylistTrackDto
    {
        public Guid MediaItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int DurationInSeconds { get; set; }
        public DateTime AddedAt { get; set; } // Ngày bài hát này được đưa vào playlist
    }
}
