using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces
{
    public interface IPlaylistRepository
    {
        Task<Guid> CreateAsync(Playlist playlist);
    }
}
