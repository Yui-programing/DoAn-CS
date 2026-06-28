using MediatR;
using System;

namespace TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem
{
    public class SharedMediaItemCommand : IRequest<Guid>
    {
        
        public Guid SenderId { get; set; }
        public Guid MediaItemId { get; set; } 

        
        public Guid ReceiverId { get; set; }
        public string? Message { get; set; }
    }
}

