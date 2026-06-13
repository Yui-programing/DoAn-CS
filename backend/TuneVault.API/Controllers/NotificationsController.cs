using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.API.Common;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using TuneVault.API.Hubs;

namespace TuneVault.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRepository _repository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationsController(INotificationRepository repository, IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _hubContext = hubContext;
        }

        private string? GetUserIdFromJwt() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet]
        public async Task<IActionResult> GetList()
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var list = await _repository.GetByUserIdAsync(userId);
            return Ok(ApiResponse<IEnumerable<Notification>>.SetSuccess(list, "Lấy danh sách thông báo thành công."));
        }

        [HttpPost]
        public async Task<IActionResult> Create(NotificationCreateRequest request)
        {
            var senderId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(senderId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            if (string.IsNullOrWhiteSpace(request.UserId))
                return BadRequest(ApiResponse<object>.SetFailure(message: "UserId không được để trống."));
            if (string.IsNullOrWhiteSpace(request.PayloadJson))
                return BadRequest(ApiResponse<object>.SetFailure(message: "PayloadJson không được để trống."));

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Type = request.Type,
                PayloadJson = request.PayloadJson,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            bool created = await _repository.CreateAsync(notification);
            if (!created)
                return BadRequest(ApiResponse<bool>.SetFailure(message: "Không thể tạo thông báo mới."));

            await _hubContext.Clients.User(request.UserId).SendAsync("ReceiveNotification", notification);

            return Ok(ApiResponse<Notification>.SetSuccess(notification, "Thông báo đã được gửi tới user."));
        }

        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            bool ok = await _repository.MarkAsReadAsync(id);
            if (!ok)
                return BadRequest(ApiResponse<bool>.SetFailure(message: "Không thể đánh dấu thông báo là đã đọc."));

            // Notify the user via SignalR (frontend may or may not be listening)
            await _hubContext.Clients.User(userId).SendAsync("NotificationRead", id);

            return Ok(ApiResponse<bool>.SetSuccess(true, "Đã đánh dấu thông báo là đã đọc."));
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserIdFromJwt();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            int affected = await _repository.MarkAllAsReadAsync(userId);
            await _hubContext.Clients.User(userId).SendAsync("NotificationsMarkedRead", affected);

            return Ok(ApiResponse<int>.SetSuccess(affected, "Đã đánh dấu tất cả thông báo là đã đọc."));
        }

        public class NotificationCreateRequest
        {
            public string UserId { get; set; } = null!;
            public NotificationType Type { get; set; } = NotificationType.System;
            public string PayloadJson { get; set; } = null!;
        }
    }
}
