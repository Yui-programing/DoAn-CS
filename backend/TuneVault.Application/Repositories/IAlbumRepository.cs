using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;
using TuneVault.Application.Models;

namespace TuneVault.Application.Repositories
{
    public interface IAlbumRepository
    {
        Task<Guid> CreateAlbumAsync(Album album);
        Task<IEnumerable<AlbumDto>> GetAlbumsByArtistIdAsync(Guid artistId);
        Task<AlbumDto?> GetAlbumByIdAsync(Guid albumId);
        Task<bool> UpdateMediaItemsAlbumAsync(Guid albumId, string albumName, List<Guid> mediaItemIds, Guid artistId);
        Task<IEnumerable<PlaylistTrackDto>> GetTracksByAlbumIdAsync(Guid albumId);
    }
}
