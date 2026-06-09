using System.IO;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Medias;

public class UploadSongCoverCommandHandler
{
    private readonly ICloudinaryService _cloudinaryService;

    public UploadSongCoverCommandHandler(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    // Sửa tham số truyền vào từ IFormFile sang Stream và fileName
    public async Task<string> Handle(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        if (fileStream == null || fileStream.Length == 0)
        {
            return string.Empty;
        }

        // Gọi hàm upload qua interface đã được chuẩn hóa
        string imageUrl = await _cloudinaryService.UploadImageAsync(fileStream, fileName, "TuneVault/Covers");
        
        return imageUrl;
    }
}