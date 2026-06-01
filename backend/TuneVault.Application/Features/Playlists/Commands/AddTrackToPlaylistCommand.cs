using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common.Models;

namespace TuneVault.Application.Features.Playlists.Commands
{
    public class AddTrackToPlaylistCommand: IRequest<ApiResponse<string>>
    {
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }

    }
}
