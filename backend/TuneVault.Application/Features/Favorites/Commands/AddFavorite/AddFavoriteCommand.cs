using MediatR;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.AddFavorite
{
    public class AddFavoriteCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid MediaItemId { get; set; }
    }
}


