using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Features.Share
{
    public class ShareAlbumRequest
    {
        public Guid ReceiverId { get; set; }
        public Guid AlbumId { get; set; }
        public string? Message { get; set; }
    }
}
