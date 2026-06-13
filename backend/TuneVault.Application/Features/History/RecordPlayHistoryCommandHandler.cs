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

        // 2. Tạo bản ghi lịch sử mới
        var playHistory = new PlayHistory
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            MediaItemId = request.MediaItemId,
            PlayedAt = DateTime.UtcNow
        };

        // 3. Ghi nhận lịch sử nghe nhạc
        bool isSuccess = await _playHistoryRepository.AddPlayHistoryAsync(playHistory);

        // 4. Tự động tăng lượt nghe cho bài hát đó trong database
        if (isSuccess)
        {
            await _mediaItemRepository.IncrementPlayCountAsync(request.MediaItemId);
        }

        return isSuccess;
    }
}
