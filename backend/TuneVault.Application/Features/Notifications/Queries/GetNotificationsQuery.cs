using MediatR;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Notifications.Queries
{
    public class GetNotificationsQuery : IRequest<IEnumerable<Notification>>
    {
        public string UserId { get; set; } = null!;
    }
}
