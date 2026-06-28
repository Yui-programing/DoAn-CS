using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Features.Share
{
    public class SharePlaylistRequest
    {
        public Guid ReceiverId { get; set; }
        public Guid PlaylistId { get; set; }
        public string? Message { get; set; }
    }

}
