using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Notification>
    {
        private readonly INotificationRepository _repository;
        private readonly INotificationService _notificationService;

        public CreateNotificationCommandHandler(INotificationRepository repository, INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        public async Task<Notification> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Type = request.Type,
                PayloadJson = request.PayloadJson,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            bool created = await _repository.CreateAsync(notification);
            if (!created)
            {
                throw new Exception("Không thể tạo thông báo mới.");
            }

            // Push notification via SignalR
            await _notificationService.SendNotificationToUserAsync(request.UserId, notification);

            return notification;
        }
    }
}
