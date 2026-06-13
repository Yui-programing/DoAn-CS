using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationToUserAsync(string userId, Notification notification);
        Task NotifyUserReadAsync(string userId, System.Guid notificationId);
        Task NotifyUserMarkedAllReadAsync(string userId, int count);
    }
}
