using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IArtistRegistrationRepository
    {
        Task<Guid> AddAsync(ArtistRegistration registration);
        Task<IEnumerable<ArtistRegistration>> GetPendingAsync();
        Task<ArtistRegistration?> GetByIdAsync(Guid id);
        Task<bool> UpdateStatusAsync(Guid id, string status, DateTime? reviewedAt = null);
        Task<IEnumerable<ArtistRegistration>> GetByUserIdAsync(Guid userId);
    }
}

