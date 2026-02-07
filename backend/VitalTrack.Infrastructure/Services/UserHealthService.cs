using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.UserHealth;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Enums;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;
using VitalTrack.Infrastructure.Utils;

namespace VitalTrack.Infrastructure.Services;

public class UserHealthService : IUserHealthService
{
    private readonly HealthDbContext _context;
    private readonly IMessageService _messageService;

    public UserHealthService(HealthDbContext context, IMessageService messageService)
    {
        _context = context;
        _messageService = messageService;
    }

    public async Task<ApiResult<string>> SaveAsync(int userId, List<UserHealthSaveDto> dtos)
    {
        var now = DateTime.Now;
        var messages = new List<Message>();

        foreach (var dto in dtos)
        {
            _context.UserHealths.Add(new UserHealth
            {
                UserId = userId,
                HealthModelConfigId = dto.HealthModelConfigId,
                Value = dto.Value,
                CreateTime = now
            });

            var healthModel = await _context.HealthModelConfigs.FindAsync(dto.HealthModelConfigId);
            if (healthModel?.ValueRange != null)
            {
                var range = healthModel.ValueRange.Split(',');
                if (range.Length == 2 && double.TryParse(range[0], out var min) && 
                    double.TryParse(range[1], out var max) && double.TryParse(dto.Value, out var value))
                {
                    if (value < min || value > max)
                    {
                        messages.Add(new Message
                        {
                            Content = $"你记录的【{healthModel.Name}】超标了，正常值范围:[{healthModel.ValueRange}]，请注意休息。必要时请就医!",
                            MessageType = (int)MessageType.DataMessage,
                            ReceiverId = userId,
                            IsRead = false,
                            CreateTime = now
                        });
                    }
                }
            }
        }

        await _context.SaveChangesAsync();
        if (messages.Count > 0) await _messageService.DataWordSaveAsync(messages);
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var records = await _context.UserHealths.Where(h => ids.Contains(h.Id)).ToListAsync();
        _context.UserHealths.RemoveRange(records);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> UpdateAsync(UserHealth entity)
    {
        var existing = await _context.UserHealths.FindAsync(entity.Id);
        if (existing == null) return ApiResult<string>.Error("记录不存在");
        existing.Value = entity.Value;
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<UserHealthVo>>> QueryAsync(UserHealthQueryDto dto)
    {
        var query = from h in _context.UserHealths
                    join u in _context.Users on h.UserId equals u.Id
                    join m in _context.HealthModelConfigs on h.HealthModelConfigId equals m.Id
                    select new { Health = h, User = u, Model = m };

        if (dto.UserId.HasValue) query = query.Where(x => x.Health.UserId == dto.UserId.Value);
        if (dto.HealthModelConfigId.HasValue) query = query.Where(x => x.Health.HealthModelConfigId == dto.HealthModelConfigId.Value);
        if (dto.StartTime.HasValue) query = query.Where(x => x.Health.CreateTime >= dto.StartTime.Value);
        if (dto.EndTime.HasValue) query = query.Where(x => x.Health.CreateTime <= dto.EndTime.Value);

        var total = await query.CountAsync();
        var data = await query.OrderByDescending(x => x.Health.CreateTime).Skip(dto.Skip).Take(dto.Take)
            .Select(x => new UserHealthVo
            {
                Id = x.Health.Id, UserId = x.Health.UserId, UserName = x.User.UserName,
                HealthModelConfigId = x.Health.HealthModelConfigId, HealthModelName = x.Model.Name,
                Unit = x.Model.Unit, Symbol = x.Model.Symbol, ValueRange = x.Model.ValueRange,
                Value = x.Health.Value, CreateTime = x.Health.CreateTime
            }).ToListAsync();

        return ApiResult<List<UserHealthVo>>.Success(data, total);
    }

    public async Task<ApiResult<List<ChartVo>>> DaysQueryAsync(int day)
    {
        var (startTime, endTime) = DateUtil.GetStartAndEndTime(day);
        var dates = await _context.UserHealths
            .Where(h => h.CreateTime >= startTime && h.CreateTime <= endTime)
            .Select(h => h.CreateTime.Date).ToListAsync();
        return ApiResult<List<ChartVo>>.Success(DateUtil.CountDatesWithinRange(day, dates));
    }
}

