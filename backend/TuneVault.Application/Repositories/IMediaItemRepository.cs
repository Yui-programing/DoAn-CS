using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories;

public interface IMediaItemRepository
{
    Task<Guid> AddAsync(MediaItem mediaItem);
    Task<MediaItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(string ownerId);
    Task UpdateAsync(MediaItem mediaItem);
    Task<bool> DeleteAsync(Guid id);
}
