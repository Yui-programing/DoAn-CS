using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class ShareMediaItemRequest
    {
        public string ReceiverId { get; set; } = null!;
        public Guid MediaItemId { get; set; }
        
        public string? Message { get; set; }
    }
    public class SharePlaylistRequest
    {
        public string Receiverid { get; set; } = null!;
        public Guid PlaylistId { get; set; }
        public string? Message { get; set; }
    }
    public class SharedMediaItemDto
    {
        public Guid MediaItemId { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public DateTime SharedAt { get; set; }
        public string? Message { get; set; }
    }
    public class SharedPlaylistDto
    {
        public Guid PlaylistId { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public DateTime SharedAt { get; set; }
        public string? Message { get; set; }
    }
}
