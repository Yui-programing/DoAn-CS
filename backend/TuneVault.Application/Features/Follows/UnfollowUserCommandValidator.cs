using FluentValidation;
using System;

namespace TuneVault.Application.Features.Follows
{
    public class UnfollowUserCommandValidator : AbstractValidator<UnfollowUserCommand>
    {
        public UnfollowUserCommandValidator()
        {
            RuleFor(x => x.FollowerId)
                .NotEmpty().WithMessage("ID người theo dõi không được để trống.");

            RuleFor(x => x.FollowingUserId)
                .NotEmpty().WithMessage("ID người được theo dõi không được để trống.");
        }
    }
}
