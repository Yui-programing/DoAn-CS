using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist
{
    public class CreatePlaylistValidator: AbstractValidator<CreatePlaylistCommand>
    {
        public CreatePlaylistValidator() 
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tên playlist không được để trống.")
                .MaximumLength(100).WithMessage("Tên playlist không được vượt quá 100 ký tự.");
            RuleFor(x => x.CurrentUserId)
                .NotEmpty().WithMessage("UserId không hợp lệ.");
        }
    }
}
