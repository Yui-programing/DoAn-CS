using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistValidator : AbstractValidator<UpdatePlaylistCommand>
    {
        // Inject DbContext hoặc Repository của bạn vào đây
        private readonly IPlaylistRepository _context;

        public UpdatePlaylistValidator(IPlaylistRepository context)
        {
            _context = context;

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tên playlist không được để trống.")
                .MaximumLength(100).WithMessage("Tên playlist không được vượt quá 100 ký tự.")
                // Thêm rule check trùng bằng DB
                .MustAsync(BeUniqueTitle).WithMessage("Tên playlist này đã tồn tại, vui lòng chọn tên khác.");
        }

        // ✅ ĐÃ SỬA: Truyền đủ 4 tham số
        private async Task<bool> BeUniqueTitle(UpdatePlaylistCommand command, string title, CancellationToken cancellationToken)
        {
            return await _context.IsTitleUniqueAsync(
                title,
                command.Id,       // Id của Playlist (để loại trừ chính nó khi update)
                command.OwnerId,  // Id của User
                cancellationToken);
        }
    }
}
