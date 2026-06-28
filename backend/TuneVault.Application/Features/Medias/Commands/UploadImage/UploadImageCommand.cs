using MediatR;
using System.IO;

namespace TuneVault.Application.Features.Medias.Commands.UploadImage;

public class UploadImageCommand : IRequest<string>
{
    public Stream ImageStream { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FolderName { get; set; } = null!;
}
