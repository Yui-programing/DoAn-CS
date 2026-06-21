using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationToUserAsync(Guid userId, Notification notification);
        Task NotifyUserReadAsync(Guid userId, System.Guid notificationId);
        Task NotifyUserMarkedAllReadAsync(Guid userId, int count);
    }
}

