using MediatR;
using System;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class GetInboxContactsQuery : IRequest<InboxResultDto>
    {
        public Guid UserId { get; set; }
    }
}
