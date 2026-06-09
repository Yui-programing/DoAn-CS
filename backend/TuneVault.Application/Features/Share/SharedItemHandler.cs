using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Share
{
    public class ShareMediaItemCommandHandler : IRequestHandler<ShareMediaItemCommand, Guid>
    {
        private readonly ISharedMediaRepository _sharedMediaRepository;

        public ShareMediaItemCommandHandler(ISharedMediaRepository sharedMediaRepository)
        {
            _sharedMediaRepository = sharedMediaRepository;
        }

        public async Task<Guid> Handle(ShareMediaItemCommand request, CancellationToken cancellationToken)
        {
            // 1. (Tùy chọn) Bạn có thể inject IMediaItemRepository vào đây để check xem 
            // bài hát có thực sự tồn tại trước khi chia sẻ hay không.

            // 2. (Tùy chọn) Check xem ReceiverId có tồn tại trong hệ thống User không.

            // 3. Tạo ID cho bản ghi chia sẻ
            var sharedId = Guid.NewGuid();

            // 4. Lưu xuống DB
            await _sharedMediaRepository.ShareItemAsync(
                sharedId,
                request.SenderId,
                request.ReceiverId,
                request.MediaItemId,
                request.Message);

            return sharedId;
        }
    }
}
