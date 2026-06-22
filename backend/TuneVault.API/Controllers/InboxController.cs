using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using TuneVault.API.Common;
using TuneVault.Application.Features.Share.Inbox;
using TuneVault.Application.Models;
using System.Collections.Generic;

namespace TuneVault.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InboxController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InboxController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private Guid GetUserIdFromJwt()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId)) return userId;
            return Guid.Empty;
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
            var currentUserId = GetUserIdFromJwt();
            if (currentUserId == Guid.Empty) return Unauthorized();

            var query = new GetInboxContactsQuery { UserId = currentUserId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<InboxResultDto>.SetSuccess(result));
        }

        [HttpGet("chat/{otherUserId}")]
        public async Task<IActionResult> GetChatHistory(Guid otherUserId)
        {
            var currentUserId = GetUserIdFromJwt();
            if (currentUserId == Guid.Empty) return Unauthorized();

            var query = new GetChatHistoryQuery
            {
                CurrentUserId = currentUserId,
                OtherUserId = otherUserId
            };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<ChatHistoryItemDto>>.SetSuccess(result));
        }

        [HttpPost("accept/{senderId}")]
        public async Task<IActionResult> AcceptMessageRequest(Guid senderId)
        {
            var receiverId = GetUserIdFromJwt();
            if (receiverId == Guid.Empty) return Unauthorized();

            var command = new AcceptMessageRequestCommand
            {
                ReceiverId = receiverId,
                SenderId = senderId
            };
            var result = await _mediator.Send(command);
            
            if (result)
            {
                return Ok(ApiResponse<bool>.SetSuccess(true, "Đã chấp nhận tin nhắn."));
            }
            return BadRequest(ApiResponse<bool>.SetFailure(message: "Không có tin nhắn chờ nào từ người này hoặc đã được chấp nhận."));
        }
    }
}
