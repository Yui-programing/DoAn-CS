using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Favorites.Commands.AddFavorite
{
    public class AddFavoriteHandler : IRequestHandler<AddFavoriteCommand, bool>
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public AddFavoriteHandler(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<bool> Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra xem bài hát đã được yêu thích chưa
            var exists = await _favoriteRepository.ExistsAsync(request.UserId, request.MediaItemId);
            if (exists)
            {
                // Nếu đã thả tim rồi thì có thể coi như thành công hoặc throw exception. Ở đây chọn trả về true (idempotent).
                return true; 
            }

            var favorite = new Favorite
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                MediaItemId = request.MediaItemId,
                AddedAt = DateTime.UtcNow
            };

            await _favoriteRepository.AddAsync(favorite);

            return true;
        }
    }
}
