using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Tags;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;

namespace VitalTrack.Infrastructure.Services;

public class TagsService : ITagsService
{
    private readonly HealthDbContext _context;

    public TagsService(HealthDbContext context) => _context = context;

    public async Task<ApiResult<string>> SaveAsync(Tags entity)
    {
        if (await _context.Tags.AnyAsync(t => t.Name == entity.Name))
            return ApiResult<string>.Error("标签已存在");
        _context.Tags.Add(entity);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var tags = await _context.Tags.Where(t => ids.Contains(t.Id)).ToListAsync();
        _context.Tags.RemoveRange(tags);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> UpdateAsync(Tags entity)
    {
        var existing = await _context.Tags.FindAsync(entity.Id);
        if (existing == null) return ApiResult<string>.Error("标签不存在");
        existing.Name = entity.Name;
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<Tags>>> QueryAsync(TagsQueryDto dto)
    {
        var query = _context.Tags.AsQueryable();
        if (!string.IsNullOrEmpty(dto.Name)) query = query.Where(t => t.Name.Contains(dto.Name));

        var total = await query.CountAsync();
        var data = await query.OrderBy(t => t.Id).Skip(dto.Skip).Take(dto.Take).ToListAsync();
        return ApiResult<List<Tags>>.Success(data, total);
    }
}

