using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Follows.Queries
{
    public class GetFollowingUsersQuery : IRequest<IEnumerable<UserProfile>>
    {
        public Guid UserId { get; set; }
    }
}
