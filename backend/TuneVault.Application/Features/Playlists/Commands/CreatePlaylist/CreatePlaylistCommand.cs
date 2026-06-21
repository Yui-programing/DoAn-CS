using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;


namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist
{
    public class CreatePlaylistCommand: IRequest<Guid>
    {
        
        public String Title { get; set; } = string.Empty;

        public String? Description { get; set; }

        public bool IsPublic { get; set; }
        public Guid OwnerId { get; set; } 

    }
}


