using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Features.Share
{
    public class SharePlaylistCommand: IRequest<Guid>
    {
        public string ReceiverId { get; set; } = null!;
        public string SenderId { get; set; } = null!;

        public Guid PlaylistId { get; set; }

        public string? Message { get; set; }

    }
}
