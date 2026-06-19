using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class UpdateArtistBannerCommandHandler : IRequestHandler<UpdateArtistBannerCommand, bool>
    {
        private readonly IArtistRepository _artistRepository;

        public UpdateArtistBannerCommandHandler(IArtistRepository artistRepository)
        {
            _artistRepository = artistRepository;
        }

        public async Task<bool> Handle(UpdateArtistBannerCommand request, CancellationToken cancellationToken)
        {
            return await _artistRepository.UpdateBannerAsync(request.ArtistId, request.BannerUrl);
        }
    }
}
