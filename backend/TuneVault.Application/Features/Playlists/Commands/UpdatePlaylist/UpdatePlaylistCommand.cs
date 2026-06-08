using System;
using System.Collections.Generic;
using System.Text;
using MediatR;


namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistCommand: IRequest<Guid>
    {
        public Guid Id { get; set; }
        public String title { get; set; } = string.Empty;

        public String? description { get; set; }

        public bool isPublic { get; set; }

        public string OwnerId { get; set; } = null!;
    }
}
