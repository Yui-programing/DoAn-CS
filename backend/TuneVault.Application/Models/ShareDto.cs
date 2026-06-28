using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class SharedMediaItemDto
    {
        public Guid MediaItemId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public DateTime SharedAt { get; set; }
        public string? Message { get; set; }
    }
    public class SharedPlaylistDto
    {
        public Guid PlaylistId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public DateTime SharedAt { get; set; }
        public string? Message { get; set; }
    }
}


