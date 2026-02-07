using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.User;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;

namespace VitalTrack.Api.Controllers;

[ApiController]
[Route("api/vital-track/v1.0/user")]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    public UserController(IUserService userService) => _userService = userService;

    [HttpPost("login")]
    public async Task<ActionResult<ApiResult<object>>> Login([FromBody] UserLoginDto dto) =>
        await _userService.LoginAsync(dto);

    [HttpPost("register")]
    public async Task<ActionResult<ApiResult<string>>> Register([FromBody] UserRegisterDto dto) =>
        await _userService.RegisterAsync(dto);

    [Authorize]
    [HttpGet("auth")]
    public async Task<ActionResult<ApiResult<UserVo>>> Auth() =>
        await _userService.AuthAsync(GetUserId());

    [Authorize]
    [HttpGet("getById/{id}")]
    public async Task<ActionResult<ApiResult<UserVo>>> GetById(int id) =>
        await _userService.GetByIdAsync(id);

    [Authorize]
    [HttpPut("update")]
    public async Task<ActionResult<ApiResult<string>>> Update([FromBody] UserUpdateDto dto) =>
        await _userService.UpdateAsync(GetUserId(), dto);

    [Authorize(Policy = "Admin")]
    [HttpPost("insert")]
    public async Task<ActionResult<ApiResult<string>>> Insert([FromBody] UserRegisterDto dto) =>
        await _userService.RegisterAsync(dto);

    [Authorize(Policy = "Admin")]
    [HttpPut("backUpdate")]
    public async Task<ActionResult<ApiResult<string>>> BackUpdate([FromBody] User user) =>
        await _userService.BackUpdateAsync(user);

    [Authorize]
    [HttpPut("updatePwd")]
    public async Task<ActionResult<ApiResult<string>>> UpdatePwd([FromBody] UpdatePwdDto dto) =>
        await _userService.UpdatePwdAsync(GetUserId(), dto);

    [Authorize(Policy = "Admin")]
    [HttpPost("batchDelete")]
    public async Task<ActionResult<ApiResult<string>>> BatchDelete([FromBody] List<int> ids) =>
        await _userService.BatchDeleteAsync(ids);

    [Authorize(Policy = "Admin")]
    [HttpPost("query")]
    public async Task<ActionResult<ApiResult<List<User>>>> Query([FromBody] UserQueryDto dto) =>
        await _userService.QueryAsync(dto);

    [HttpGet("daysQuery/{day}")]
    public async Task<ActionResult<ApiResult<List<ChartVo>>>> DaysQuery(int day) =>
        await _userService.DaysQueryAsync(day);

    private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");
}

