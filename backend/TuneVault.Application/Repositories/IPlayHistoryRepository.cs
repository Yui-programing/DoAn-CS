using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Application.Features.History;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories;

public interface IPlayHistoryRepository
{
    // Chỉ giữ lại hàm lưu lịch sử khi người dùng bấm Play
    Task<bool> AddPlayHistoryAsync(PlayHistory playHistory);
    Task<IEnumerable<PlayHistoryResultDto>> GetPlayHistoryAsync(Guid userId, int limit);
}

