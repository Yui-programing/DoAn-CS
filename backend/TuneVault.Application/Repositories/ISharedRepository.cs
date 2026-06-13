using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;

namespace TuneVault.Application.Repositories
{
    public interface ISharedRepository
    {
        Task<bool> UserExistsAsync(string userId);
        Task<bool> MediaItemExistsAsync(Guid mediaItemId);
        Task<bool> PlaylistExistsAsync(Guid id);
        Task<Guid> ShareMediaItemAsync(string senderId, string receiverId, Guid mediaItemId, string? message);

        Task<Guid> SharePlaylistAsync(string senderId, string receiverId, Guid playlistId, string? message);

        Task<IEnumerable<SharedMediaItemDto>> GetSharedMediaItemsByReceiverIdAsync(string receiverId);
    }
}
