using MediatR;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class CreateNotificationCommand : IRequest<Notification>
    {
        public string UserId { get; set; } = null!;
        public NotificationType Type { get; set; } = NotificationType.System;
        public string PayloadJson { get; set; } = null!;
    }
}
