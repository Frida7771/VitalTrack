using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.UserHealth;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface IUserHealthService
{
    Task<ApiResult<string>> SaveAsync(int userId, List<UserHealthSaveDto> dtos);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<string>> UpdateAsync(UserHealth entity);
    Task<ApiResult<List<UserHealthVo>>> QueryAsync(UserHealthQueryDto dto);
    Task<ApiResult<List<ChartVo>>> DaysQueryAsync(int day);
}

