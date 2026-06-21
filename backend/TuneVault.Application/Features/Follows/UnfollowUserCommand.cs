using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Follows
{
    public class UnfollowUserCommand : IRequest<bool>
    {
        public Guid FollowerId { get; set; }
        public Guid FollowingUserId { get; set; }
    }

    public class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, bool>
    {
        private readonly IFollowRepository _followRepository;

        public UnfollowUserCommandHandler(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        public async Task<bool> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
        {
            return await _followRepository.UnfollowAsync(request.FollowerId, request.FollowingUserId);
        }
    }
}
