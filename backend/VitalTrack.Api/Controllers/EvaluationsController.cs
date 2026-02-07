using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Evaluations;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/evaluations")]
[Route("evaluations")]
public class EvaluationsController : ControllerBase
{
    private readonly IEvaluationsService _service;
    public EvaluationsController(IEvaluationsService service) => _service = service;

    [Authorize]
    [HttpPost("save")]
    [HttpPost("insert")]
    public async Task<ActionResult<ApiResult<string>>> Save([FromBody] Evaluations entity) =>
        await _service.SaveAsync(GetUserId(), entity);

    [Authorize]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _service.BatchDeleteAsync(ids);

    [Authorize]
    [HttpPost("toggleUpvote/{id}")]
    public async Task<ActionResult<ApiResult<string>>> ToggleUpvote(int id) =>
        await _service.ToggleUpvoteAsync(GetUserId(), id);

    [Authorize]
    [HttpPut("update")]
    public async Task<ActionResult<ApiResult<string>>> Update([FromBody] Evaluations entity) =>
        await _service.ToggleUpvoteAsync(GetUserId(), entity.Id);

    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<EvaluationsVo>>>> Query([FromBody] EvaluationsQueryDto dto) =>
        await _service.QueryAsync(dto);

    private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");
}

