using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IFavoriteRepository
    {
        Task<Guid> AddAsync(Favorite favorite);
        Task DeleteAsync(string userId, Guid mediaItemId);
        Task<bool> ExistsAsync(string userId, Guid mediaItemId);
        Task<IEnumerable<FavoriteDto>> GetByUserIdAsync(string userId);
    }
}
