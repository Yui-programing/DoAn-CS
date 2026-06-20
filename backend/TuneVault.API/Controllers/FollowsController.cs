using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TuneVault.API.Common;
using TuneVault.Application.Features.Follows;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FollowsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FollowsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private Guid GetUserIdFromJwt()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId)) return userId;
            return Guid.Empty;
        }

        [HttpPost("follow/{followingUserId:guid}")]
        public async Task<IActionResult> FollowUser(Guid followingUserId)
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new FollowUserCommand
            {
                FollowerId = userId,
                FollowingUserId = followingUserId
            };

            var result = await _mediator.Send(command);
            if (result)
            {
                return Ok(ApiResponse<bool>.SetSuccess(true, "Theo dõi thành công!"));
            }
            return BadRequest(ApiResponse<bool>.SetFailure(new List<string> { "Không thể theo dõi người dùng này." }, "Lỗi xử lý"));
        }

        [HttpPost("unfollow/{followingUserId:guid}")]
        public async Task<IActionResult> UnfollowUser(Guid followingUserId)
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var command = new UnfollowUserCommand
            {
                FollowerId = userId,
                FollowingUserId = followingUserId
            };

            var result = await _mediator.Send(command);
            if (result)
            {
                return Ok(ApiResponse<bool>.SetSuccess(true, "Bỏ theo dõi thành công!"));
            }
            return BadRequest(ApiResponse<bool>.SetFailure(new List<string> { "Không thể bỏ theo dõi người dùng này." }, "Lỗi xử lý"));
        }

        [HttpGet("status/{followingUserId:guid}")]
        public async Task<IActionResult> CheckFollowStatus(Guid followingUserId)
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var query = new CheckFollowStatusQuery
            {
                FollowerId = userId,
                FollowingUserId = followingUserId
            };

            var isFollowing = await _mediator.Send(query);
            return Ok(ApiResponse<bool>.SetSuccess(isFollowing, "Lấy trạng thái theo dõi thành công!"));
        }

        [HttpGet("following")]
        public async Task<IActionResult> GetFollowingArtists()
        {
            var userId = GetUserIdFromJwt();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponse<object>.SetFailure(message: "Token không hợp lệ."));

            var query = new GetFollowingArtistsQuery
            {
                UserId = userId
            };

            var following = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<UserProfile>>.SetSuccess(following, "Lấy danh sách nghệ sĩ đang theo dõi thành công!"));
        }
    }
}
