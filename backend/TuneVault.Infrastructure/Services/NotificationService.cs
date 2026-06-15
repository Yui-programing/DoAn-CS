using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Hubs;

namespace TuneVault.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationToUserAsync(string userId, Notification notification)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);
        }

        public async Task NotifyUserReadAsync(string userId, System.Guid notificationId)
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationRead", notificationId);
        }

        public async Task NotifyUserMarkedAllReadAsync(string userId, int count)
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationsMarkedRead", count);
        }
    }
}
