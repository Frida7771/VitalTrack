using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly string _uploadPath;

    public FileService(IConfiguration configuration)
    {
        _uploadPath = configuration["FileStorage:UploadPath"] ?? "wwwroot/uploads";
        if (!Directory.Exists(_uploadPath)) Directory.CreateDirectory(_uploadPath);
    }

    public async Task<ApiResult<string>> UploadAsync(IFormFile file)
    {
        if (file == null || file.Length == 0) return ApiResult<string>.Error("请选择要上传的文件");
        if (file.Length > 10 * 1024 * 1024) return ApiResult<string>.Error("文件大小不能超过10MB");

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        return ApiResult<string>.Success($"/uploads/{fileName}");
    }

    public Task<ApiResult<string>> DeleteAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadPath, fileName);
        if (File.Exists(filePath)) File.Delete(filePath);
        return Task.FromResult(ApiResult<string>.Success());
    }
}

