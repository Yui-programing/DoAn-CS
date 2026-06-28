using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface ISharedRepository
    {
        Task<bool> UserExistsAsync(Guid userId);
        Task<bool> MediaItemExistsAsync(Guid mediaItemId);
        Task<bool> PlaylistExistsAsync(Guid id);
        Task<bool> AlbumExistsAsync(Guid albumId);
        
        Task<Guid> ShareMediaItemAsync(Guid senderId, Guid receiverId, Guid mediaItemId, string? message, bool isAccepted);
        Task<Guid> SharePlaylistAsync(Guid senderId, Guid receiverId, Guid playlistId, string? message, bool isAccepted);
        Task<Guid> ShareAlbumAsync(Guid senderId, Guid receiverId, Guid albumId, string? message, bool isAccepted);
        
        
        
        Task<IEnumerable<MediaShare>> GetInboxAsync(Guid receiverId);
        Task<IEnumerable<MediaShare>> GetMessageRequestsAsync(Guid receiverId);
        Task<IEnumerable<MediaShare>> GetChatHistoryAsync(Guid userId1, Guid userId2);
        Task<bool> AcceptMessageRequestAsync(Guid receiverId, Guid senderId);
    }
}
