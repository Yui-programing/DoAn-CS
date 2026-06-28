using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Features.Share
{
    public class ShareMediaItemRequest
    {
        public Guid ReceiverId { get; set; }
        public Guid MediaItemId { get; set; }
        public string? Message { get; set; }
    }
}
