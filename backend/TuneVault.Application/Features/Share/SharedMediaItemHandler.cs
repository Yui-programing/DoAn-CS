using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using System.Text.Json;

namespace TuneVault.Application.Features.Share
{
    public class ShareItemCommandHandler : IRequestHandler<SharedMediaItemCommand, Guid>
    {
        private readonly ISharedRepository _sharedMediaRepository;
        private readonly IFollowRepository _followRepository;
        private readonly INotificationRepository _notificationRepository;

        public ShareItemCommandHandler(
            ISharedRepository sharedMediaRepository,
            IFollowRepository followRepository,
            INotificationRepository notificationRepository)
        {
            _sharedMediaRepository = sharedMediaRepository;
            _followRepository = followRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<Guid> Handle(SharedMediaItemCommand command, CancellationToken cancellationToken)
        {
            if (command.SenderId == command.ReceiverId)
            {
                throw new ArgumentException("Bạn không thể tự chia sẻ bài hát cho chính mình.");
            }

            var userExists = await _sharedMediaRepository.UserExistsAsync(command.ReceiverId);
            if (!userExists)
            {
                throw new KeyNotFoundException("Người nhận không tồn tại trên hệ thống.");
            }

            var mediaExists = await _sharedMediaRepository.MediaItemExistsAsync(command.MediaItemId);
            if (!mediaExists)
            {
                throw new KeyNotFoundException("File bài hát/media không tồn tại.");
            }

            
            var senderFollowsReceiver = await _followRepository.IsFollowingAsync(command.SenderId, command.ReceiverId);
            if (!senderFollowsReceiver)
            {
                throw new ArgumentException("Bạn phải theo dõi người này trước khi có thể chia sẻ.");
            }

            
            var receiverFollowsSender = await _followRepository.IsFollowingAsync(command.ReceiverId, command.SenderId);
            bool isAccepted = receiverFollowsSender;

            var shareId = await _sharedMediaRepository.ShareMediaItemAsync(
                command.SenderId,
                command.ReceiverId,
                command.MediaItemId,
                command.Message,
                isAccepted
            );

            
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = command.ReceiverId,
                Type = 0, 
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                PayloadJson = JsonSerializer.Serialize(new
                {
                    SenderId = command.SenderId,
                    MediaItemId = command.MediaItemId,
                    Message = "Ai đó đã chia sẻ một bài hát cho bạn.",
                    IsMessageRequest = !isAccepted
                })
            };
            await _notificationRepository.CreateAsync(notification);

            return shareId;
        }
    }
}
