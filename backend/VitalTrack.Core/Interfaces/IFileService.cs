using Microsoft.AspNetCore.Http;
using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.Interfaces;

public interface IFileService
{
    Task<ApiResult<string>> UploadAsync(IFormFile file);
    Task<ApiResult<string>> DeleteAsync(string fileName);
}

