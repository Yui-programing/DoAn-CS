using MediatR;
using System;
using System.Collections.Generic;
using System.Text;


namespace TuneVault.Application.Features.Playlists.Commands.RestorePlaylist
{
    public class RestorePlaylistCommand: IRequest<Guid>
    {
        public Guid Id { get; set; }
        public string OwnerId { get; set; } = null!;
        public bool IsDeleted { get; set; }
    }
}
