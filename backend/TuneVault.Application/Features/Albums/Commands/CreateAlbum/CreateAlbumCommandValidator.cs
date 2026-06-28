using FluentValidation;
using System;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum
{
    public class CreateAlbumCommandValidator : AbstractValidator<CreateAlbumCommand>
    {
        public CreateAlbumCommandValidator()
        {
            RuleFor(x => x.ArtistId)
                .NotEmpty().WithMessage("ArtistId không được để trống.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tên album không được để trống.")
                .MaximumLength(200).WithMessage("Tên album không được vượt quá 200 ký tự.");

            RuleFor(x => x.ReleaseDate)
                .NotEmpty().WithMessage("Ngày phát hành không được để trống.");
        }
    }
}
