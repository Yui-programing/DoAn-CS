using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Features.Playlists.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    // 1. Sửa kiểu trả về của IRequestHandler thành Guid thuần túy
    public class AddPlaylistTrackHandler : IRequestHandler<AddPlaylistTrackCommand, Guid>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public AddPlaylistTrackHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        // 2. Sửa kiểu trả về của hàm Handle thành Task<Guid>
        public async Task<Guid> Handle(AddPlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Kiểm tra quyền sở hữu playlist
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                // Thay vì return Fail, ta throw Exception (Bạn có thể custom lại class Exception này nếu muốn)
                throw new UnauthorizedAccessException("Không có quyền để thêm track vào playlist");
            }

            // 2. Kiểm tra xem track đã tồn tại trong playlist chưa
            var isMediaItemAdded = await _playlistRepository.IsMediaItemInPlaylistAsync(request.PlaylistId, request.MediaItemId);

            // LƯU Ý LÝ DO SỬA: Đoạn cũ của bạn đang là (!isMediaItemAdded) nghĩa là "NẾU CHƯA ADD THÌ BÁO LỖI ĐÃ TỒN TẠI" -> Bị ngược logic. 
            // Sửa lại thành: Nếu ĐÃ TỒN TẠI (isMediaItemAdded == true) thì mới báo lỗi.
            if (isMediaItemAdded)
            {
                throw new InvalidOperationException("Track đã tồn tại trong playlist");
            }

            // 3. Thực thi chèn dữ liệu xuống DB
            await _playlistRepository.AddTrackAsync(request.PlaylistId, request.MediaItemId);

            // 4. Trả về đúng kiểu Guid thô (Ví dụ trả về PlaylistId hoặc MediaItemId tùy bài toán của bạn)
            return request.MediaItemId;
        }
    }
}