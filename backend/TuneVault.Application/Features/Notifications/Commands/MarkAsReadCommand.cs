using MediatR;
using System;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAsReadCommand : IRequest<bool>
    {
        public Guid NotificationId { get; set; }
        public string UserId { get; set; } = null!;
    }
}
