using MediatR;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Favorites.Commands.AddFavorite
{
    public class AddFavoriteHandler : IRequestHandler<AddFavoriteCommand, bool>
    {
        private readonly IFavoriteRepository _favoriteRepository;
        private readonly IMediaItemRepository _mediaItemRepository;
        private readonly INotificationRepository _notificationRepository;

        public AddFavoriteHandler(
            IFavoriteRepository favoriteRepository,
            IMediaItemRepository mediaItemRepository,
            INotificationRepository notificationRepository)
        {
            _favoriteRepository = favoriteRepository;
            _mediaItemRepository = mediaItemRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<bool> Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
        {
            var exists = await _favoriteRepository.ExistsAsync(request.UserId, request.MediaItemId);
            if (exists)
            {
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

            // Bắn Notification cho tác giả (Owner)
            var mediaItem = await _mediaItemRepository.GetByIdAsync(request.MediaItemId);
            if (mediaItem != null)
            {
                // Nếu người thả tim khác với tác giả thì mới gửi thông báo
                if (mediaItem.ArtistId != request.UserId)
                {
                    var notification = new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = mediaItem.ArtistId, // Tác giả nhận thông báo
                        Type = (TuneVault.Domain.Enums.NotificationType)2, // 2 = System hoặc Tương tác
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false,
                        PayloadJson = JsonSerializer.Serialize(new
                        {
                            ActionUserId = request.UserId, // Người vừa tim
                            MediaItemId = request.MediaItemId,
                            Message = "Ai đó vừa thả tim bài hát của bạn!"
                        })
                    };
                    await _notificationRepository.CreateAsync(notification);
                }
            }
            return true;
        }
    }
}
