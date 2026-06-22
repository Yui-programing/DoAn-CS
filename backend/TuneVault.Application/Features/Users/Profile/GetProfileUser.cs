using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Users.Profile
{
    // Yêu cầu lấy thông tin profile, truyền vào UserId kiểu string lấy từ Token
    public class GetProfileQuery : IRequest<UserProfileDto>
    {
        public Guid UserId { get; set; }
    }

    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPublic { get; set; } = true;
        
        // Artist fields
        public string? Genres { get; set; }
        public string? BannerUrl { get; set; }
        public DateTime? VerifiedAt { get; set; }

        // Follow counts
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        
        // Other stats
        public int PlaylistCount { get; set; }
        public int FavoriteCount { get; set; }
    }

    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserProfileDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IArtistRepository _artistRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IPlaylistRepository _playlistRepository;
        private readonly IFavoriteRepository _favoriteRepository;

        public GetProfileQueryHandler(
            IUserRepository userRepository, 
            IArtistRepository artistRepository, 
            IFollowRepository followRepository,
            IPlaylistRepository playlistRepository,
            IFavoriteRepository favoriteRepository)
        {
            _userRepository = userRepository;
            _artistRepository = artistRepository;
            _followRepository = followRepository;
            _playlistRepository = playlistRepository;
            _favoriteRepository = favoriteRepository;
        }

        public async Task<UserProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            // 1. Tìm user trong DB theo UserId (kiểu string)
            var user = await _userRepository.GetUserWithProfileByIdAsync(request.UserId);

            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng");
            }

            // 2. Trả về thông tin profile cho Frontend
            var dto = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                FullName = user.Profile?.FullName ?? string.Empty,
                Bio = user.Profile?.Bio,
                AvatarUrl = user.Profile?.AvatarUrl,
                IsPublic = user.Profile?.IsPublic ?? true
            };

            // Fetch follow counts dynamically (Option 1)
            dto.FollowerCount = await _followRepository.GetFollowerCountAsync(request.UserId);
            dto.FollowingCount = await _followRepository.GetFollowingCountAsync(request.UserId);

            // Fetch Playlist and Favorite counts
            var playlists = await _playlistRepository.GetByOwnerIdAsync(request.UserId);
            dto.PlaylistCount = playlists.Count();

            var favorites = await _favoriteRepository.GetByUserIdAsync(request.UserId);
            dto.FavoriteCount = favorites.Count();

            if (user.Role == "Artist")
            {
                var artist = await _artistRepository.GetArtistByIdAsync(user.Id);
                if (artist != null)
                {
                    dto.Genres = artist.Genres;
                    dto.BannerUrl = artist.BannerUrl;
                    dto.VerifiedAt = artist.VerifiedAt;
                }
            }

            return dto;
        }
    }
}


