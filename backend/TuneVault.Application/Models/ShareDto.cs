using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class ShareRequest
    {
        public string ReceiverId { get; set; } = null!;
        public Guid? MediaItemId { get; set; }
        public Guid? PlaylistId { get; set; }
        public string? Message { get; set; }
    }
}
