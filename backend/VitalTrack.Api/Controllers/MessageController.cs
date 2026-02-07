using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Message;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/message")]
[Route("message")]
public class MessageController : ControllerBase
{
    private readonly IMessageService _service;
    public MessageController(IMessageService service) => _service = service;

    [Authorize]
    [HttpPost("save")]
    public async Task<ActionResult<ApiResult<string>>> Save([FromBody] Message entity) =>
        await _service.SaveAsync(entity);

    [Authorize]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _service.BatchDeleteAsync(ids);

    [Authorize]
    [HttpPost("markRead")]
    public async Task<ActionResult<ApiResult<string>>> MarkRead([FromBody] List<int> ids) =>
        await _service.MarkReadAsync(ids);

    [Authorize]
    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<MessageVo>>>> Query([FromBody] MessageQueryDto dto) =>
        await _service.QueryAsync(dto);

    [Authorize]
    [HttpGet("unreadCount")]
    public async Task<ActionResult<ApiResult<int>>> GetUnreadCount() =>
        await _service.GetUnreadCountAsync(GetUserId());

    [Authorize]
    [HttpGet("types")]
    public ActionResult<ApiResult<List<object>>> GetMessageTypes() =>
        ApiResult<List<object>>.Success(new List<object>
        {
            new { Type = 1, Name = "回复通知" },
            new { Type = 2, Name = "点赞通知" },
            new { Type = 3, Name = "数据提醒" },
            new { Type = 4, Name = "系统通知" }
        });

    [Authorize]
    [HttpPut("clearMessage")]
    public async Task<ActionResult<ApiResult<string>>> ClearMessage() =>
        await _service.ClearUserMessagesAsync(GetUserId());

    [Authorize(Policy = "Admin")]
    [HttpPost("systemInfoUsersSave")]
    public async Task<ActionResult<ApiResult<string>>> SystemInfoUsersSave([FromBody] SystemMessageDto dto) =>
        await _service.SendSystemMessageToAllAsync(dto.Content);

    private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");
}

public class SystemMessageDto
{
    public string Content { get; set; } = string.Empty;
}

