using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.API.Common;
using TuneVault.Application.Features.Playlists.Commands.ViewPlaylist;
using TuneVault.Application.Features.Share;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{
    [Authorize] // Bắt buộc đăng nhập để lấy thông tin SenderId từ JWT
    [ApiController]
    [Route("api/[controller]")]
    
    public class ShareController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ShareController(IMediator mediator)
        {
            _mediator = mediator;
        }
        private string? GetUserIdFromJwt() => User.FindFirstValue(ClaimTypes.NameIdentifier);
        // Đường dẫn dạng: POST /api/share
        [HttpPost]
        public async Task<IActionResult> ShareMedia([FromBody] ShareMediaItemRequest request)
        {
            // 1. Lấy UserId của người gửi từ JWT token hiện tại
            var senderId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(senderId))
            {
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ hoặc đã hết hạn."));
            }

            
            
            // 2. Đóng gói dữ liệu đầu vào thành Command gửi xuống Handler
            var command = new SharedMediaItemCommand
            {
                MediaItemId = request.MediaItemId,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Message = request.Message
            };

            // 3. Chờ kết quả xử lý từ MediatR
            var result = await _mediator.Send(command);

            // 4. Trả về phản hồi thành công bọc trong ApiResponse
            return Ok(ApiResponse<Guid>.SetSuccess(result, "Chia sẻ bài hát thành công!"));
            
            
        }
        [HttpGet]
        public async Task<IActionResult> GetMyShareMedia()
        {
            var receiverId = GetUserIdFromJwt();
            if(string.IsNullOrEmpty(receiverId))
            {
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ hoặc đã hết hạn."));
            }
            var query = new GetMediaItemQuery
            {
                OwnerId= receiverId
            };
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<SharedMediaItemDto>>.SetSuccess(result, "Lấy danh sách bài hát được chia sẻ thành công!"));
        }
    }
}
