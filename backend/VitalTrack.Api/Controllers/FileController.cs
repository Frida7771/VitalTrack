using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/file")]
[Route("file")]
public class FileController : ControllerBase
{
    private readonly IFileService _service;
    public FileController(IFileService service) => _service = service;

    [Authorize]
    [HttpPost("upload")]
    public async Task<ActionResult<ApiResult<string>>> Upload(IFormFile file) =>
        await _service.UploadAsync(file);

    [Authorize]
    [HttpDelete("delete/{fileName}")]
    public async Task<ActionResult<ApiResult<string>>> Delete(string fileName) =>
        await _service.DeleteAsync(fileName);
}

