using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using System.Text.Json;

namespace TuneVault.Application.Features.Share
{
    public class ShareAlbumHandler : IRequestHandler<ShareAlbumCommand, Guid>
    {
        private readonly ISharedRepository _sharedMediaRepository;
        private readonly IFollowRepository _followRepository;
        private readonly INotificationRepository _notificationRepository;

        public ShareAlbumHandler(
            ISharedRepository sharedMediaRepository,
            IFollowRepository followRepository,
            INotificationRepository notificationRepository)
        {
            _sharedMediaRepository = sharedMediaRepository;
            _followRepository = followRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<Guid> Handle(ShareAlbumCommand command, CancellationToken cancellationToken)
        {
            if (command.SenderId == command.ReceiverId)
            {
                throw new ArgumentException("Bạn không thể tự chia sẻ album cho chính mình.");
            }

            var userExists = await _sharedMediaRepository.UserExistsAsync(command.ReceiverId);
            if (!userExists)
            {
                throw new KeyNotFoundException("Người nhận không tồn tại trên hệ thống.");
            }

            var albumExists = await _sharedMediaRepository.AlbumExistsAsync(command.AlbumId);
            if (!albumExists)
            {
                throw new KeyNotFoundException("Album không tồn tại.");
            }

            
            var senderFollowsReceiver = await _followRepository.IsFollowingAsync(command.SenderId, command.ReceiverId);
            if (!senderFollowsReceiver)
            {
                throw new ArgumentException("Bạn phải theo dõi người này trước khi có thể chia sẻ.");
            }

            
            var receiverFollowsSender = await _followRepository.IsFollowingAsync(command.ReceiverId, command.SenderId);
            bool isAccepted = receiverFollowsSender;

            var shareId = await _sharedMediaRepository.ShareAlbumAsync(
                command.SenderId,
                command.ReceiverId,
                command.AlbumId,
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
                    AlbumId = command.AlbumId,
                    Message = "Ai đó đã chia sẻ một Album cho bạn.",
                    IsMessageRequest = !isAccepted
                })
            };
            await _notificationRepository.CreateAsync(notification);

            return shareId;
        }
    }
}
