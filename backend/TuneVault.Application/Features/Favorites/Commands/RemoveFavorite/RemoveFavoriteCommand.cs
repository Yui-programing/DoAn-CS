using MediatR;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.RemoveFavorite
{
    public class RemoveFavoriteCommand : IRequest<bool>
    {
        public string UserId { get; set; } = null!;
        public Guid MediaItemId { get; set; }
    }
}
