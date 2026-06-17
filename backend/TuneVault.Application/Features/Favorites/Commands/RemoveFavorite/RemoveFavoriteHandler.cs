using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Favorites.Commands.RemoveFavorite
{
    public class RemoveFavoriteHandler : IRequestHandler<RemoveFavoriteCommand, bool>
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public RemoveFavoriteHandler(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<bool> Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
        {
            await _favoriteRepository.DeleteAsync(request.UserId, request.MediaItemId);
            return true;
        }
    }
}
