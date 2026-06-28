using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Notifications.Commands;
using TuneVault.Application.Features.Notifications.Queries;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

            private Guid GetUserIdFromJwt()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId)) return userId;
            return Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetList()
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var list = await _mediator.Send(new GetNotificationsQuery { UserId = userId });
            return Ok(ApiResponse<IEnumerable<Notification>>.SetSuccess(list, "Lấy danh sách thông báo thành công."));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request)
        {
            var senderId = GetUserIdFromJwt();
            if (senderId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new CreateNotificationCommand
            {
                UserId = request.UserId,
                Type = request.Type,
                PayloadJson = request.PayloadJson
            };

            var notification = await _mediator.Send(command);
            return Ok(ApiResponse<Notification>.SetSuccess(notification, "Thông báo đã được gửi tới user."));
        }

        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new MarkAsReadCommand { NotificationId = id, UserId = userId };
            bool ok = await _mediator.Send(command);

            if (!ok)
                return BadRequest(ApiResponse<bool>.SetFailure(message: "Không thể đánh dấu thông báo là đã đọc."));

            return Ok(ApiResponse<bool>.SetSuccess(true, "Đã đánh dấu thông báo là đã đọc."));
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new MarkAllAsReadCommand { UserId = userId };
            int affected = await _mediator.Send(command);

            return Ok(ApiResponse<int>.SetSuccess(affected, "Đã đánh dấu tất cả thông báo là đã đọc."));
        }

        public class CreateNotificationRequest
        {
            public Guid UserId { get; set; }
            public NotificationType Type { get; set; } = NotificationType.System;
            public string PayloadJson { get; set; } = null!;
        }
    }
}


