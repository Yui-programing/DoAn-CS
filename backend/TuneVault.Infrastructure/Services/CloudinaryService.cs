using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.IO;
using Microsoft.Extensions.Options;
using TuneVault.Application.Repositories;
using TuneVault.Infrastructure.Configurations;

namespace TuneVault.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string folderName)
    {
        if (fileStream == null || fileStream.Length == 0) return string.Empty;

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folderName,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };
        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        return uploadResult.SecureUrl?.ToString() ?? string.Empty;
    }

  public async Task<string> UploadAudioAsync(Stream fileStream, string fileName, string folderName)
{
    if (fileStream == null || fileStream.Length == 0) return string.Empty;
    var uploadParams = new VideoUploadParams
    {
        File = new FileDescription(fileName, fileStream),
        Folder = folderName,
        Type = "upload",
        UseFilename = true,     // Sử dụng tên file truyền vào làm tên hiển thị trên cloud
        UniqueFilename = true   // Thêm chuỗi ký tự ngẫu nhiên ngắn ở cuối để đảm bảo không trùng lặp
    };

        var uploadResult = await _cloudinary.UploadLargeAsync(uploadParams);
        return uploadResult.SecureUrl?.ToString() ?? string.Empty;
    }

    public async Task<bool> DeleteFileAsync(string publicId)
    {
        var deletionParams = new DeletionParams(publicId) { ResourceType = ResourceType.Video };
        var result = await _cloudinary.DestroyAsync(deletionParams);
        return result.Result == "ok";
    }
}