using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.API.Common;
using TuneVault.Application.Features.Admin.Queries;
using TuneVault.Application.Features.Admin.Commands;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _mediator.Send(new GetUsersQuery());
            return Ok(ApiResponse<IEnumerable<AdminUserDto>>.SetSuccess(users, "Lấy danh sách người dùng thành công."));
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest request)
        {
            var command = new UpdateUserRoleCommand
            {
                UserId = id,
                Role = request.Role
            };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<bool>.SetSuccess(result, "Cập nhật role người dùng thành công."));
        }

        [HttpPut("users/{id}/active")]
        public async Task<IActionResult> SetUserActiveState(string id, [FromBody] SetUserActiveStateRequest request)
        {
            var command = new SetUserActiveStateCommand
            {
                UserId = id,
                IsActive = request.IsActive
            };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<bool>.SetSuccess(result, "Cập nhật trạng thái người dùng thành công."));
        }

        [HttpGet("artist-registrations/pending")]
        public async Task<IActionResult> GetPendingArtistRegistrations()
        {
            var items = await _mediator.Send(new TuneVault.Application.Features.Artists.Queries.GetPendingArtistRegistrationsQuery());
            return Ok(ApiResponse<IEnumerable<TuneVault.Domain.Entities.ArtistRegistration>>.SetSuccess(items, "Lấy danh sách đăng ký artist đang chờ."));
        }

        [HttpPut("artist-registrations/approve/{id}")]
        public async Task<IActionResult> ApproveArtistRegistration(Guid id)
        {
            var cmd = new TuneVault.Application.Features.Artists.Commands.ApproveArtistRegistrationCommand { RegistrationId = id };
            var result = await _mediator.Send(cmd);
            if (!result)
            {
                return BadRequest(ApiResponse<bool>.SetFailure(new List<string> { "Phê duyệt đăng ký artist thất bại." }, "Không thể phê duyệt đăng ký artist."));
            }
            return Ok(ApiResponse<bool>.SetSuccess(result, "Phê duyệt đăng ký artist thành công."));
        }

        [HttpGet("medias/pending")]
        public async Task<IActionResult> GetPendingMedias()
        {
            var items = await _mediator.Send(new TuneVault.Application.Features.Medias.Queries.GetPendingMediasQuery());
            return Ok(ApiResponse<IEnumerable<TuneVault.Domain.Entities.MediaItem>>.SetSuccess(items, "Lấy danh sách media chờ duyệt."));
        }

        [HttpPut("medias/approve/{id}")]
        public async Task<IActionResult> ApproveMedia(Guid id)
        {
            var cmd = new TuneVault.Application.Features.Medias.Commands.ApproveMediaCommand { MediaId = id };
            var result = await _mediator.Send(cmd);
            return Ok(ApiResponse<bool>.SetSuccess(result, "Phê duyệt media."));
        }

        [HttpPut("medias/reject/{id}")]
        public async Task<IActionResult> RejectMedia(Guid id, [FromBody] TuneVault.Application.Features.Medias.Commands.RejectMediaCommand body)
        {
            var cmd = new TuneVault.Application.Features.Medias.Commands.RejectMediaCommand { MediaId = id, Reason = body?.Reason };
            var result = await _mediator.Send(cmd);
            return Ok(ApiResponse<bool>.SetSuccess(result, "Từ chối media."));
        }
    }

    public class UpdateUserRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class SetUserActiveStateRequest
    {
        public bool IsActive { get; set; }
    }
}
