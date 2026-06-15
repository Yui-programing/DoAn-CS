using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
        Task<bool> CreateAsync(Notification notification);
        Task<bool> MarkAsReadAsync(Guid id);
        Task<int> MarkAllAsReadAsync(string userId);
    }
}
