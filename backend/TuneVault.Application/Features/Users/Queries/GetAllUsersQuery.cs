using MediatR;
using System.Collections.Generic;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Users.Queries
{
    public class GetAllUsersQuery : IRequest<IEnumerable<UserProfile>>
    {
    }
}