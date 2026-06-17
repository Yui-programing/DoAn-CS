using MediatR;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Favorites.Queries.GetFavorites
{
    public class GetFavoritesQuery : IRequest<IEnumerable<FavoriteDto>>
    {
        public string UserId { get; set; } = null!;
    }
}
