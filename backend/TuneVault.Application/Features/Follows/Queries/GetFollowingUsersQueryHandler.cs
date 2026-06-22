using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Follows.Queries
{
    public class GetFollowingUsersQueryHandler : IRequestHandler<GetFollowingUsersQuery, IEnumerable<UserProfile>>
    {
        private readonly IFollowRepository _followRepository;

        public GetFollowingUsersQueryHandler(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        public async Task<IEnumerable<UserProfile>> Handle(GetFollowingUsersQuery request, CancellationToken cancellationToken)
        {
            return await _followRepository.GetFollowingUsersAsync(request.UserId);
        }
    }
}
