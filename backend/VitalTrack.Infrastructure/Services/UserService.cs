using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.User;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Enums;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;
using VitalTrack.Infrastructure.Utils;

namespace VitalTrack.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly HealthDbContext _context;
    private readonly JwtUtil _jwtUtil;

    public UserService(HealthDbContext context, JwtUtil jwtUtil)
    {
        _context = context;
        _jwtUtil = jwtUtil;
    }

    public async Task<ApiResult<object>> LoginAsync(UserLoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserAccount == dto.UserAccount);
        if (user == null) return ApiResult<object>.Error("账号不存在");
        if (user.UserPwd != dto.UserPwd) return ApiResult<object>.Error("密码错误");
        if (user.IsLogin) return ApiResult<object>.Error("登录状态异常");

        var token = _jwtUtil.GenerateToken(user.Id, user.UserRole);
        return ApiResult<object>.Success(new { token, role = user.UserRole }, "登录成功");
    }

    public async Task<ApiResult<string>> RegisterAsync(UserRegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.UserName == dto.UserName))
            return ApiResult<string>.Error("用户名已经被使用");
        if (await _context.Users.AnyAsync(u => u.UserAccount == dto.UserAccount))
            return ApiResult<string>.Error("账号不可用");

        var user = new User
        {
            UserName = dto.UserName,
            UserAccount = dto.UserAccount,
            UserPwd = dto.UserPwd,
            UserEmail = dto.UserEmail,
            UserAvatar = dto.UserAvatar,
            UserRole = (int)RoleEnum.User,
            CreateTime = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success(msg: "注册成功");
    }

    public async Task<ApiResult<UserVo>> AuthAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return ApiResult<UserVo>.Error("用户不存在");
        return ApiResult<UserVo>.Success(MapToVo(user));
    }

    public async Task<ApiResult<UserVo>> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return ApiResult<UserVo>.Error("用户不存在");
        return ApiResult<UserVo>.Success(MapToVo(user));
    }

    public async Task<ApiResult<string>> UpdateAsync(int userId, UserUpdateDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return ApiResult<string>.Error("用户不存在");

        if (!string.IsNullOrEmpty(dto.UserName)) user.UserName = dto.UserName;
        if (!string.IsNullOrEmpty(dto.UserAvatar)) user.UserAvatar = dto.UserAvatar;
        if (!string.IsNullOrEmpty(dto.UserEmail)) user.UserEmail = dto.UserEmail;

        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BackUpdateAsync(User user)
    {
        var existing = await _context.Users.FindAsync(user.Id);
        if (existing == null) return ApiResult<string>.Error("用户不存在");

        _context.Entry(existing).CurrentValues.SetValues(user);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> UpdatePwdAsync(int userId, UpdatePwdDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return ApiResult<string>.Error("用户不存在");
        if (user.UserPwd != dto.OldPwd) return ApiResult<string>.Error("原始密码验证失败");

        user.UserPwd = dto.NewPwd;
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var users = await _context.Users.Where(u => ids.Contains(u.Id)).ToListAsync();
        _context.Users.RemoveRange(users);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<User>>> QueryAsync(UserQueryDto dto)
    {
        var query = _context.Users.AsQueryable();
        if (!string.IsNullOrEmpty(dto.UserName)) query = query.Where(u => u.UserName.Contains(dto.UserName));
        if (!string.IsNullOrEmpty(dto.UserAccount)) query = query.Where(u => u.UserAccount == dto.UserAccount);
        if (dto.UserRole.HasValue) query = query.Where(u => u.UserRole == dto.UserRole.Value);
        if (dto.StartTime.HasValue) query = query.Where(u => u.CreateTime >= dto.StartTime.Value);
        if (dto.EndTime.HasValue) query = query.Where(u => u.CreateTime <= dto.EndTime.Value);

        var total = await query.CountAsync();
        var users = await query.OrderByDescending(u => u.CreateTime).Skip(dto.Skip).Take(dto.Take).ToListAsync();
        return ApiResult<List<User>>.Success(users, total);
    }

    public async Task<ApiResult<List<ChartVo>>> DaysQueryAsync(int day)
    {
        var (startTime, endTime) = DateUtil.GetStartAndEndTime(day);
        var dates = await _context.Users
            .Where(u => u.CreateTime >= startTime && u.CreateTime <= endTime)
            .Select(u => u.CreateTime.Date).ToListAsync();
        return ApiResult<List<ChartVo>>.Success(DateUtil.CountDatesWithinRange(day, dates));
    }

    private static UserVo MapToVo(User user) => new()
    {
        Id = user.Id, UserAccount = user.UserAccount, UserName = user.UserName,
        UserAvatar = user.UserAvatar, UserEmail = user.UserEmail, UserRole = user.UserRole,
        IsLogin = user.IsLogin, IsWord = user.IsWord, CreateTime = user.CreateTime
    };
}

