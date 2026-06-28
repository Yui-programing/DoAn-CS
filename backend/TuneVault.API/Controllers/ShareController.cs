using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using TuneVault.API.Common;
using TuneVault.Application.Features.Share;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;
using TuneVault.Application.Models;

namespace TuneVault.API.Controllers
{
    
    [Authorize]
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

        [HttpPost("media")]
        public async Task<IActionResult> ShareMedia([FromBody] ShareMediaItemRequest request)
        {
            var senderId = GetUserIdFromJwt();
            if (senderId == Guid.Empty) return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new SharedMediaItemCommand
            {
                MediaItemId = request.MediaItemId,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Message = request.Message
            };

            var shareId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.SetSuccess(shareId, "Chia sẻ bài hát thành công."));
        }

        [HttpPost("playlist")]
        public async Task<IActionResult> SharePlaylist([FromBody] SharePlaylistRequest request)
        {
            var senderId = GetUserIdFromJwt();
            if (senderId == Guid.Empty) return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new SharePlaylistCommand
            {
                PlaylistId = request.PlaylistId,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Message = request.Message
            };

            var shareId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.SetSuccess(shareId, "Chia sẻ Playlist thành công."));
        }

        [HttpPost("album")]
        public async Task<IActionResult> ShareAlbum([FromBody] ShareAlbumRequest request)
        {
            var senderId = GetUserIdFromJwt();
            if (senderId == Guid.Empty) return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new ShareAlbumCommand
            {
                AlbumId = request.AlbumId,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Message = request.Message
            };

            var shareId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.SetSuccess(shareId, "Chia sẻ Album thành công."));
        }
    }
}
