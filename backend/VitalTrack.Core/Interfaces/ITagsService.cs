using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Tags;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface ITagsService
{
    Task<ApiResult<string>> SaveAsync(Tags entity);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<string>> UpdateAsync(Tags entity);
    Task<ApiResult<List<Tags>>> QueryAsync(TagsQueryDto dto);
}

