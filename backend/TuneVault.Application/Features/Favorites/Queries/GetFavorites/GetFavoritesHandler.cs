using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Favorites.Queries.GetFavorites
{
    public class GetFavoritesHandler : IRequestHandler<GetFavoritesQuery, IEnumerable<FavoriteDto>>
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public GetFavoritesHandler(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<IEnumerable<FavoriteDto>> Handle(GetFavoritesQuery request, CancellationToken cancellationToken)
        {
            return await _favoriteRepository.GetByUserIdAsync(request.UserId);
        }
    }
}
