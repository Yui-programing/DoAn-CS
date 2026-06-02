using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist
{
    public class CreatePlaylistCommand: IRequest<ApiResponseDto<Guid>>
    {
        public String Title { get; set; } = string.Empty;

        public String? Description { get; set; }

        public bool IsPublic { get; set; }

        public String CurrentUserId { get; set; } = null!;

        
    }
}
