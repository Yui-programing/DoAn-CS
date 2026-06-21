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
    [Authorize] // B?t bu?c dang nh?p d? l?y thông tin SenderId t? JWT
    [ApiController]
    [Route("api/[controller]")]
    
    public class ShareController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ShareController(IMediator mediator)
        {
            _mediator = mediator;
        }
                private Guid GetUserIdFromJwt()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId)) return userId;
            return Guid.Empty;
        }
        // Ðu?ng d?n d?ng: POST /api/share
        [HttpPost]
        public async Task<IActionResult> ShareMedia([FromBody] ShareMediaItemRequest request)
        {
            // 1. L?y UserId c?a ngu?i g?i t? JWT token hi?n t?i
            var senderId = GetUserIdFromJwt();
            if (senderId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không h?p l? ho?c dã h?t h?n."));
            }

            
            
            // 2. Ðóng gói d? li?u d?u vào thành Command g?i xu?ng Handler
            var command = new SharedMediaItemCommand
            {
                MediaItemId = request.MediaItemId,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Message = request.Message
            };

            // 3. Ch? k?t qu? x? lý t? MediatR
            var result = await _mediator.Send(command);

            // 4. Tr? v? ph?n h?i thành công b?c trong ApiResponse
            return Ok(ApiResponse<Guid>.SetSuccess(result, "Chia s? bài hát thành công!"));
            
            
        }
        [HttpGet]
        public async Task<IActionResult> GetMyShareMedia()
        {
            var receiverId = GetUserIdFromJwt();
            if(receiverId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không h?p l? ho?c dã h?t h?n."));
            }
            var query = new GetMediaItemQuery
            {
                OwnerId= receiverId
            };
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<SharedMediaItemDto>>.SetSuccess(result, "L?y danh sách bài hát du?c chia s? thành công!"));
        }
    }
}

