using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class MyPlaylistDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TracksCount { get; set; }
    }
}
