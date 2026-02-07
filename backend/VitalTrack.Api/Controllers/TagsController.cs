using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Tags;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/tags")]
[Route("tags")]
public class TagsController : ControllerBase
{
    private readonly ITagsService _service;
    public TagsController(ITagsService service) => _service = service;

    [Authorize(Policy = "Admin")]
    [HttpPost("save")]
    public async Task<ActionResult<ApiResult<string>>> Save([FromBody] Tags entity) =>
        await _service.SaveAsync(entity);

    [Authorize(Policy = "Admin")]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _service.BatchDeleteAsync(ids);

    [Authorize(Policy = "Admin")]
    [HttpPut("update")]
    public async Task<ActionResult<ApiResult<string>>> Update([FromBody] Tags entity) =>
        await _service.UpdateAsync(entity);

    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<Tags>>>> Query([FromBody] TagsQueryDto dto) =>
        await _service.QueryAsync(dto);
}

