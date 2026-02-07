using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Evaluations;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface IEvaluationsService
{
    Task<ApiResult<string>> SaveAsync(int userId, Evaluations entity);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<string>> ToggleUpvoteAsync(int userId, int evaluationId);
    Task<ApiResult<List<EvaluationsVo>>> QueryAsync(EvaluationsQueryDto dto);
}

