using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;
using TuneVault.Application.Models;

namespace TuneVault.Application.Repositories
{
    public interface IPlaylistRepository
    {
        Task<Guid> CreateAsync(Playlist playlist);

        Task UpdateAsync(Playlist playlist);

        Task DeleteAsync(Guid playlistId);
        

        Task AddTrackAsync(Guid playlistId, Guid mediaitemId);

        Task RemoveTrackAsync(Guid playlistId, Guid mediaitemId);

        Task<bool> IsOwnerAsync (Guid playlistId, Guid userId);

        Task<bool> IsMediaItemInPlaylistAsync(Guid playlistId, Guid mediaitemId);

        Task<bool> IsTitleUniqueAsync(string title, Guid Id, Guid userId, CancellationToken cancellationToken);

        Task<bool> IsPlaylistEmptyAsync(Guid playlistId);

        Task<bool> IsPlaylistDeletedAsync(Guid playlistId);
        
        Task<bool> HasAccessAsync(Guid playlistId, Guid userId);

        Task<IEnumerable<MyPlaylistDto>> GetByOwnerIdAsync(Guid userId);

        Task<IEnumerable<MyPlaylistDto>> GetPublicByUserIdAsync(Guid userId);

        Task<MyPlaylistDto?> GetByIdAsync(Guid playlistId);

        Task<IEnumerable<PlaylistTrackDto>> GetTracksByPlaylistIdAsync(Guid playlistId);
    }
}

