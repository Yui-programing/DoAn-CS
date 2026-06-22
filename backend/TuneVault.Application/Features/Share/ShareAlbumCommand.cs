using MediatR;
using System;

namespace TuneVault.Application.Features.Share
{
    public class ShareAlbumCommand : IRequest<Guid>
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public Guid AlbumId { get; set; }
        public string? Message { get; set; }
    }
}
