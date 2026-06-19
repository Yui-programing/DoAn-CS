using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IArtistRepository
    {
        Task<bool> AddArtistAsync(Artist artist);
        Task<Artist?> GetArtistByIdAsync(Guid artistId);
        Task<bool> UpdateBannerAsync(Guid artistId, string bannerUrl);
    }
}
