using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, bool>
    {
        private readonly INotificationRepository _repository;
        private readonly INotificationService _notificationService;

        public MarkAsReadCommandHandler(INotificationRepository repository, INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        public async Task<bool> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
        {
            // Note: In a real system, you might want to verify if the notification belongs to request.UserId
            bool ok = await _repository.MarkAsReadAsync(request.NotificationId);
            
            if (ok)
            {
                await _notificationService.NotifyUserReadAsync(request.UserId, request.NotificationId);
            }

            return ok;
        }
    }
}
