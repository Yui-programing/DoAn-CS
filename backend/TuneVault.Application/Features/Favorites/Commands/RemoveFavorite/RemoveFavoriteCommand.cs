using MediatR;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.RemoveFavorite
{
    public class RemoveFavoriteCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid MediaItemId { get; set; }
    }
}


