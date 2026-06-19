using MediatR;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAllAsReadCommand : IRequest<int>
    {
        public Guid UserId { get; set; }
    }
}


