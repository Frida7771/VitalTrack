using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.HealthModel;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface IHealthModelConfigService
{
    Task<ApiResult<string>> SaveAsync(HealthModelConfig entity);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<string>> UpdateAsync(HealthModelConfig entity);
    Task<ApiResult<List<HealthModelConfigVo>>> QueryAsync(HealthModelConfigQueryDto dto);
    Task<ApiResult<List<HealthModelConfigVo>>> GetUserModelsAsync(int userId);
}

