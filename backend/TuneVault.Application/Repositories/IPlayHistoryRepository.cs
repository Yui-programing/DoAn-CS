using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories;

public interface IPlayHistoryRepository
{
    // Chỉ giữ lại hàm lưu lịch sử khi người dùng bấm Play
    Task<bool> AddPlayHistoryAsync(PlayHistory playHistory);
}
