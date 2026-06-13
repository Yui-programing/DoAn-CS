using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Share
{
    public class SharePlaylistHandler : IRequestHandler<SharePlaylistCommand, Guid>
    {
        private readonly ISharedRepository _sharedMediaRepository;

        public SharePlaylistHandler(ISharedRepository sharedMediaRepository)
        {
            _sharedMediaRepository = sharedMediaRepository;
        }

        public async Task<Guid> Handle(SharePlaylistCommand command, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra logic nghiệp vụ: Không cho tự chia sẻ cho chính mình
            if (command.SenderId == command.ReceiverId)
            {
                throw new ArgumentException("Bạn không thể tự chia sẻ bài hát cho chính mình.");
            }

            // 2. Gọi Repo check người nhận có tồn tại không
            var userExists = await _sharedMediaRepository.UserExistsAsync(command.ReceiverId);
            if (!userExists)
            {
                throw new KeyNotFoundException("Người nhận không tồn tại trên hệ thống.");
            }


            var playlistExists = await _sharedMediaRepository.PlaylistExistsAsync(command.PlaylistId);
            if (!playlistExists)
            {
                throw new KeyNotFoundException("File bài hát/media không tồn tại.");
            }



            // 4. Mọi điều kiện hợp lệ -> Tiến hành lưu xuống DB và nhận lại Id bản ghi
            var shareId = await _sharedMediaRepository.SharePlaylistAsync(
                command.SenderId,
                command.ReceiverId,
                command.PlaylistId,
                command.Message
            );

            return shareId;
        }
    }
}