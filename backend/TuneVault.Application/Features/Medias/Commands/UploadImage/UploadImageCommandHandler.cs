using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Medias.Commands.UploadImage;

public class UploadImageCommandHandler : IRequestHandler<UploadImageCommand, string>
{
    private readonly ICloudinaryService _cloudinaryService;

    public UploadImageCommandHandler(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    public async Task<string> Handle(UploadImageCommand request, CancellationToken cancellationToken)
    {
        if (request.ImageStream == null || request.ImageStream.Length == 0)
        {
            throw new FluentValidation.ValidationException("File ảnh không hợp lệ.");
        }

        var url = await _cloudinaryService.UploadImageAsync(request.ImageStream, request.FileName, request.FolderName);
        return url;
    }
}
