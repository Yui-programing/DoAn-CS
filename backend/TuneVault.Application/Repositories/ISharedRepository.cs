using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;

namespace TuneVault.Application.Repositories
{
    public interface ISharedRepository
    {
        Task<bool> UserExistsAsync(Guid userId);
        Task<bool> MediaItemExistsAsync(Guid mediaItemId);
        Task<bool> PlaylistExistsAsync(Guid id);
        Task<Guid> ShareMediaItemAsync(Guid senderId, Guid receiverId, Guid mediaItemId, string? message);

        Task<Guid> SharePlaylistAsync(Guid senderId, Guid receiverId, Guid playlistId, string? message);

        Task<IEnumerable<SharedMediaItemDto>> GetSharedMediaItemsByReceiverIdAsync(Guid receiverId);
    }
}

