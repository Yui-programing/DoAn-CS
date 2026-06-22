using MediatR;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Features.Notifications.Commands;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Enums;

namespace TuneVault.Application.Features.Follows
{
    public class FollowUserCommand : IRequest<bool>
    {
        public Guid FollowerId { get; set; }
        public Guid FollowingUserId { get; set; }
    }

    public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, bool>
    {
        private readonly IFollowRepository _followRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMediator _mediator;

        public FollowUserCommandHandler(IFollowRepository followRepository, IUserRepository userRepository, IMediator mediator)
        {
            _followRepository = followRepository;
            _userRepository = userRepository;
            _mediator = mediator;
        }

        public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
        {
            // Xoá check thủ công FollowerId == FollowingUserId vì đã có Validator lo
            // Check if target profile exists
            var targetProfile = await _userRepository.GetProfileByUserIdAsync(request.FollowingUserId);
            if (targetProfile == null)
                return false;

            var result = await _followRepository.FollowAsync(request.FollowerId, request.FollowingUserId);
            if (result)
            {
                // Send notification to the followed user/artist
                var followerProfile = await _userRepository.GetProfileByUserIdAsync(request.FollowerId);
                var followerName = followerProfile?.FullName ?? "Một người dùng";

                var payload = new
                {
                    SenderId = request.FollowerId,
                    Message = $"{followerName} đã bắt đầu theo dõi bạn."
                };

                try
                {
                    await _mediator.Send(new CreateNotificationCommand
                    {
                        UserId = request.FollowingUserId,
                        Type = NotificationType.NewFollower,
                        PayloadJson = JsonSerializer.Serialize(payload)
                    }, cancellationToken);
                }
                catch (Exception)
                {
                    // Ignore notification failures to not block follow action
                }
            }

            return result;
        }
    }
}
