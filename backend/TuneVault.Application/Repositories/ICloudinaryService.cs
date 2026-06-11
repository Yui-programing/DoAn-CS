using System.IO;

namespace TuneVault.Application.Repositories;

public interface ICloudinaryService
{
    // Dùng Stream và string IFormFile để tách biệt hoàn toàn với tầng Web
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string folderName);
    Task<string> UploadAudioAsync(Stream fileStream, string fileName, string folderName);
    Task<bool> DeleteFileAsync(string publicId);
}