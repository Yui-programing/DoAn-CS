using MediatR;
using System;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class AcceptMessageRequestCommand : IRequest<bool>
    {
        public Guid ReceiverId { get; set; }
        public Guid SenderId { get; set; }
    }
}
