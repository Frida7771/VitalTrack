using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.HealthModel;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/health-model-config")]
[Route("health-model-config")]
public class HealthModelConfigController : ControllerBase
{
    private readonly IHealthModelConfigService _service;
    public HealthModelConfigController(IHealthModelConfigService service) => _service = service;

    [Authorize(Policy = "Admin")]
    [HttpPost("save")]
    [HttpPost("config/save")]
    public async Task<ActionResult<ApiResult<string>>> Save([FromBody] HealthModelConfig entity) =>
        await _service.SaveAsync(entity);

    [Authorize(Policy = "Admin")]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _service.BatchDeleteAsync(ids);

    [Authorize(Policy = "Admin")]
    [HttpPut("update")]
    public async Task<ActionResult<ApiResult<string>>> Update([FromBody] HealthModelConfig entity) =>
        await _service.UpdateAsync(entity);

    [Authorize(Policy = "Admin")]
    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<HealthModelConfigVo>>>> Query([FromBody] HealthModelConfigQueryDto dto) =>
        await _service.QueryAsync(dto);

    [Authorize]
    [HttpGet("userModels")]
    [HttpPost("modelList")]
    public async Task<ActionResult<ApiResult<List<HealthModelConfigVo>>>> GetUserModels() =>
        await _service.GetUserModelsAsync(GetUserId());

    private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");
}

