using FluentValidation;
using System;

namespace TuneVault.Application.Features.Follows
{
    public class FollowUserCommandValidator : AbstractValidator<FollowUserCommand>
    {
        public FollowUserCommandValidator()
        {
            RuleFor(x => x.FollowerId)
                .NotEmpty().WithMessage("ID người theo dõi không được để trống.");

            RuleFor(x => x.FollowingUserId)
                .NotEmpty().WithMessage("ID người được theo dõi không được để trống.");

            RuleFor(x => x)
                .Must(x => x.FollowerId != x.FollowingUserId)
                .WithMessage("Bạn không thể tự theo dõi chính mình.");
        }
    }
}
