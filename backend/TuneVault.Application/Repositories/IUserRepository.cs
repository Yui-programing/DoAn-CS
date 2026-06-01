using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserProfile>> GetAllAsync();
    }
}