using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand, int>
    {
        private readonly INotificationRepository _repository;
        private readonly INotificationService _notificationService;

        public MarkAllAsReadCommandHandler(INotificationRepository repository, INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        public async Task<int> Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
        {
            int affected = await _repository.MarkAllAsReadAsync(request.UserId);
            
            if (affected > 0)
            {
                await _notificationService.NotifyUserMarkedAllReadAsync(request.UserId, affected);
            }

            return affected;
        }
    }
}
