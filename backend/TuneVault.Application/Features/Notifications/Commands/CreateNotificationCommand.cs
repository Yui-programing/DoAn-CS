using MediatR;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class CreateNotificationCommand : IRequest<Notification>
    {
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; } = NotificationType.System;
        public string PayloadJson { get; set; } = null!;
    }
}


