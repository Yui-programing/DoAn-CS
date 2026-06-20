using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Follows
{
    public class CheckFollowStatusQuery : IRequest<bool>
    {
        public Guid FollowerId { get; set; }
        public Guid FollowingUserId { get; set; }
    }

    public class CheckFollowStatusQueryHandler : IRequestHandler<CheckFollowStatusQuery, bool>
    {
        private readonly IFollowRepository _followRepository;

        public CheckFollowStatusQueryHandler(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        public async Task<bool> Handle(CheckFollowStatusQuery request, CancellationToken cancellationToken)
        {
            return await _followRepository.IsFollowingAsync(request.FollowerId, request.FollowingUserId);
        }
    }
}
