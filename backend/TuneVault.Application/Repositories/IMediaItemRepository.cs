using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories;

public interface IMediaItemRepository
{
    Task<Guid> AddAsync(MediaItem mediaItem);
    Task<MediaItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<MediaItem>> GetByArtistIdAsync(Guid artistId);
    Task UpdateAsync(MediaItem mediaItem);
    Task<bool> DeleteAsync(Guid id);
    //Phương thức tăng lượng nghe cho chức năng 4 và 10
    Task IncrementPlayCountAsync(Guid id);
    // Admin / Moderation
    Task<IEnumerable<MediaItem>> GetPendingMediaItemsAsync();
    Task<bool> UpdateMediaItemStatusAsync(Guid id, string status);
}

