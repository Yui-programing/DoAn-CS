using System;
using System.Collections.Generic;
using System.Text;
using MediatR;


namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistCommand: IRequest<Guid>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsPublic { get; set; }

        public Guid OwnerId { get; set; }
    }
}


