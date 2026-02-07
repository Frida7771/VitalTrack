using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.User;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface IUserService
{
    Task<ApiResult<object>> LoginAsync(UserLoginDto dto);
    Task<ApiResult<string>> RegisterAsync(UserRegisterDto dto);
    Task<ApiResult<UserVo>> AuthAsync(int userId);
    Task<ApiResult<UserVo>> GetByIdAsync(int id);
    Task<ApiResult<string>> UpdateAsync(int userId, UserUpdateDto dto);
    Task<ApiResult<string>> BackUpdateAsync(User user);
    Task<ApiResult<string>> UpdatePwdAsync(int userId, UpdatePwdDto dto);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<List<User>>> QueryAsync(UserQueryDto dto);
    Task<ApiResult<List<ChartVo>>> DaysQueryAsync(int day);
}

