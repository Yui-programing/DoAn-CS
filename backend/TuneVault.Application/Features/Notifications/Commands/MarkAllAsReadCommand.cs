using MediatR;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAllAsReadCommand : IRequest<int>
    {
        public string UserId { get; set; } = null!;
    }
}
