using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common;

namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist
{
    public class DeletePlaylistCommand: IRequest<ApiResponseDto<Guid>>
    {
        public Guid Id {  get; set; }

        public string OwnerId { get; set; } = null!;
        public bool IsDeleted { get; set; }
 
    }
}
