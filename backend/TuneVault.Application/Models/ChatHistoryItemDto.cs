using System;

namespace TuneVault.Application.Models
{
    public class ChatHistoryItemDto
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
        
        // Attached Media Info
        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }
        public Guid? AlbumId { get; set; }
        
        // Human-readable titles for frontend
        public string? AttachedMediaTitle { get; set; }
        public string? AttachedMediaCoverUrl { get; set; }
    }
}
