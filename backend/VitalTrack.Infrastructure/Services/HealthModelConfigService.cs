using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.HealthModel;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;

namespace VitalTrack.Infrastructure.Services;

public class HealthModelConfigService : IHealthModelConfigService
{
    private readonly HealthDbContext _context;

    public HealthModelConfigService(HealthDbContext context) => _context = context;

    public async Task<ApiResult<string>> SaveAsync(HealthModelConfig entity)
    {
        _context.HealthModelConfigs.Add(entity);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var configs = await _context.HealthModelConfigs.Where(c => ids.Contains(c.Id)).ToListAsync();
        _context.HealthModelConfigs.RemoveRange(configs);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> UpdateAsync(HealthModelConfig entity)
    {
        var existing = await _context.HealthModelConfigs.FindAsync(entity.Id);
        if (existing == null) return ApiResult<string>.Error("配置不存在");
        _context.Entry(existing).CurrentValues.SetValues(entity);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<HealthModelConfigVo>>> QueryAsync(HealthModelConfigQueryDto dto)
    {
        var query = from c in _context.HealthModelConfigs
                    join u in _context.Users on c.UserId equals u.Id into userJoin
                    from u in userJoin.DefaultIfEmpty()
                    select new { Config = c, User = u };

        if (dto.Id.HasValue) query = query.Where(x => x.Config.Id == dto.Id.Value);
        if (dto.UserId.HasValue) query = query.Where(x => x.Config.UserId == dto.UserId.Value);
        if (!string.IsNullOrEmpty(dto.Name)) query = query.Where(x => x.Config.Name.Contains(dto.Name));
        if (dto.IsGlobal.HasValue) query = query.Where(x => x.Config.IsGlobal == dto.IsGlobal.Value);

        var total = await query.CountAsync();
        var data = await query.OrderByDescending(x => x.Config.Id).Skip(dto.Skip).Take(dto.Take)
            .Select(x => new HealthModelConfigVo
            {
                Id = x.Config.Id, UserId = x.Config.UserId, UserName = x.User != null ? x.User.UserName : null,
                Name = x.Config.Name, Detail = x.Config.Detail, Cover = x.Config.Cover, Unit = x.Config.Unit,
                Symbol = x.Config.Symbol, ValueRange = x.Config.ValueRange, IsGlobal = x.Config.IsGlobal
            }).ToListAsync();

        return ApiResult<List<HealthModelConfigVo>>.Success(data, total);
    }

    public async Task<ApiResult<List<HealthModelConfigVo>>> GetUserModelsAsync(int userId)
    {
        var data = await _context.HealthModelConfigs
            .Where(c => c.IsGlobal || c.UserId == userId)
            .Select(c => new HealthModelConfigVo
            {
                Id = c.Id, UserId = c.UserId, Name = c.Name, Detail = c.Detail, Cover = c.Cover,
                Unit = c.Unit, Symbol = c.Symbol, ValueRange = c.ValueRange, IsGlobal = c.IsGlobal
            }).ToListAsync();
        return ApiResult<List<HealthModelConfigVo>>.Success(data);
    }
}

