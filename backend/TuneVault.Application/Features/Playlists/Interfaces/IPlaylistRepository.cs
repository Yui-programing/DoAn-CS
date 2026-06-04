using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Interfaces
{
    public interface IPlaylistRepository
    {
        Task<Guid> CreateAsync(Playlist playlist);

        Task UpdateAsync(Playlist playlist);

        Task DeleteAsync(Guid playlistId);
        Task RestoreAsync(Guid playlistId);

        Task AddTrackAsync(Guid playlistId, Guid mediaitemId);

        Task RemoveTrackAsync(Guid playlistId, Guid mediaitemId);

        Task<bool> IsOwnerAsync (Guid playlistId, string userId);

        Task<bool> IsMediaItemInPlaylistAsync(Guid playlistId, Guid mediaitemId);

        Task<bool> IsTitleUniqueAsync(string title, Guid Id, string userId, CancellationToken cancellationToken);

           
    }
}
