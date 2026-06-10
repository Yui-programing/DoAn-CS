using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.API.Common;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Bắt buộc đăng nhập để lấy thông tin SenderId từ JWT
    public class MediaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MediaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Đường dẫn dạng: POST /api/media/3fa85f64-5717-4562-b3fc-2c963f66afa6/share
        [HttpPost("{mediaItemId:guid}/share")]
        public async Task<IActionResult> ShareMedia(Guid mediaItemId, [FromBody] ShareRequest request)
        {
            // 1. Lấy UserId của người gửi từ JWT token hiện tại
            var senderId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId))
            {
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ hoặc đã hết hạn."));
            }

            try
            {
                // 2. Đóng gói dữ liệu đầu vào thành Command gửi xuống Handler
                var command = new SharedItemCommand
                {
                    MediaItemId = mediaItemId,
                    SenderId = senderId,
                    ReceiverId = request.ReceiverId
                };

                // 3. Chờ kết quả xử lý từ MediatR
                var result = await _mediator.Send(command);

                // 4. Trả về phản hồi thành công bọc trong ApiResponse
                return Ok(ApiResponse<Guid>.SetSuccess(result, "Chia sẻ bài hát thành công!"));
            }
            catch (ArgumentException ex) // Bắt lỗi logic tự share
            {
                return BadRequest(ApiResponse<object>.SetFailure(
                    new List<string> { ex.Message },
                    "Thao tác không hợp lệ."));
            }
            catch (KeyNotFoundException ex) // Bắt lỗi không tìm thấy User nhận hoặc Media
            {
                return NotFound(ApiResponse<object>.SetFailure(
                    new List<string> { ex.Message },
                    "Không tìm thấy tài nguyên."));
            }
            catch (Exception ex) // Bắt các lỗi hệ thống không lường trước
            {
                return StatusCode(500, ApiResponse<object>.SetFailure(
                    new List<string> { ex.Message },
                    "Có lỗi xảy ra từ hệ thống nội bộ."));
            }
        }
    }
}
