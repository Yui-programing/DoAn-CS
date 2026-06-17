using MediatR;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.AddFavorite
{
    public class AddFavoriteCommand : IRequest<bool>
    {
        public string UserId { get; set; } = null!;
        public Guid MediaItemId { get; set; }
    }
}
