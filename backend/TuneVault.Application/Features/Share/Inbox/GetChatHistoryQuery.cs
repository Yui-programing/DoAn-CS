using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class GetChatHistoryQuery : IRequest<IEnumerable<ChatHistoryItemDto>>
    {
        public Guid CurrentUserId { get; set; }
        public Guid OtherUserId { get; set; }
    }
}
