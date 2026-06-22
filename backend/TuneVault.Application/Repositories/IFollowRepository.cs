using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IFollowRepository
    {
        Task<bool> FollowAsync(Guid followerId, Guid followingUserId);
        Task<bool> UnfollowAsync(Guid followerId, Guid followingUserId);
        Task<bool> IsFollowingAsync(Guid followerId, Guid followingUserId);
        Task<int> GetFollowerCountAsync(Guid userId);
        Task<int> GetFollowingCountAsync(Guid userId);
        Task<IEnumerable<UserProfile>> GetFollowingArtistsAsync(Guid userId);
        Task<IEnumerable<UserProfile>> GetFollowingUsersAsync(Guid userId);
    }
}
