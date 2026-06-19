using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.History;

public class RecordPlayHistoryCommandHandler : IRequestHandler<RecordPlayHistoryCommand, bool>
{
    private readonly IPlayHistoryRepository _playHistoryRepository;
    private readonly IMediaItemRepository _mediaItemRepository;

    public RecordPlayHistoryCommandHandler(
        IPlayHistoryRepository playHistoryRepository,
        IMediaItemRepository mediaItemRepository)
    {
        _playHistoryRepository = playHistoryRepository;
        _mediaItemRepository = mediaItemRepository;
    }

    public async Task<bool> Handle(RecordPlayHistoryCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra bài hát có tồn tại không
        var mediaItem = await _mediaItemRepository.GetByIdAsync(request.MediaItemId);
        if (mediaItem == null) return false;

        bool isSuccess = true;

        // 2. Nếu có đăng nhập thì lưu vào bảng PlayHistory
        if (request.UserId.HasValue && request.UserId.Value != Guid.Empty)
        {
            var playHistory = new PlayHistory
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId.Value,
                MediaItemId = request.MediaItemId,
                PlayedAt = DateTime.UtcNow
            };

            isSuccess = await _playHistoryRepository.AddPlayHistoryAsync(playHistory);
        }

        // 3. Tự động tăng lượt nghe cho bài hát đó trong database (Cho cả người chưa đăng nhập)
        if (isSuccess)
        {
            await _mediaItemRepository.IncrementPlayCountAsync(request.MediaItemId);
        }

        return isSuccess;
    }
}
