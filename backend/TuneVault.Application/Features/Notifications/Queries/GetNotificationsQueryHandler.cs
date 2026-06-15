using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Notifications.Queries
{
    public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, IEnumerable<Notification>>
    {
        private readonly INotificationRepository _repository;

        public GetNotificationsQueryHandler(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Notification>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByUserIdAsync(request.UserId);
        }
    }
}
