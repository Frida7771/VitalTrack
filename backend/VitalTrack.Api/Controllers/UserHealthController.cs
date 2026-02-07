using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.UserHealth;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/user-health")]
[Route("user-health")]
public class UserHealthController : ControllerBase
{
    private readonly IUserHealthService _service;
    public UserHealthController(IUserHealthService service) => _service = service;

    [Authorize]
    [HttpPost("save")]
    public async Task<ActionResult<ApiResult<string>>> Save([FromBody] List<UserHealthSaveDto> dtos) =>
        await _service.SaveAsync(GetUserId(), dtos);

    [Authorize]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _service.BatchDeleteAsync(ids);

    [Authorize]
    [HttpPut("update")]
    public async Task<ActionResult<ApiResult<string>>> Update([FromBody] UserHealth entity) =>
        await _service.UpdateAsync(entity);

    [Authorize]
    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<UserHealthVo>>>> Query([FromBody] UserHealthQueryDto dto) =>
        await _service.QueryAsync(dto);

    [HttpGet("daysQuery/{day}")]
    public async Task<ActionResult<ApiResult<List<ChartVo>>>> DaysQuery(int day) =>
        await _service.DaysQueryAsync(day);

    private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");
}

