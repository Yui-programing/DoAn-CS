using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Repositories
{
    public interface ISharedRepository
    {
        Task<bool> UserExistsAsync(string userId);
        Task<bool> MediaItemExistsAsync(Guid mediaItemId);
        Task<bool> PlaylistExistsAsync(Guid id);
        Task<Guid> ShareItemAsync(string senderId, string receiverId, Guid? id, Guid? mediaItemId, string? message);
    }
}
