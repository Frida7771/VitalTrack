using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Infrastructure.Data;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/views")]
[Route("views")]
public class ViewsController : ControllerBase
{
    private readonly HealthDbContext _context;
    public ViewsController(HealthDbContext context) => _context = context;

    [Authorize(Policy = "Admin")]
    [HttpGet("staticControls")]
    public async Task<ActionResult<ApiResult<List<object>>>> GetStaticControls()
    {
        var userCount = await _context.Users.CountAsync();
        var healthRecordCount = await _context.UserHealths.CountAsync();
        var modelCount = await _context.HealthModelConfigs.CountAsync();
        var messageCount = await _context.Messages.CountAsync();
        var evaluationCount = await _context.Evaluations.CountAsync();

        var data = new List<object>
        {
            new { Name = "用户", Count = userCount },
            new { Name = "健康记录", Count = healthRecordCount },
            new { Name = "健康模型", Count = modelCount },
            new { Name = "消息", Count = messageCount },
            new { Name = "评论", Count = evaluationCount }
        };

        return ApiResult<List<object>>.Success(data);
    }
}

