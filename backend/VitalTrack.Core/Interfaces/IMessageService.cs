using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Message;
using VitalTrack.Core.Entities;

namespace VitalTrack.Core.Interfaces;

public interface IMessageService
{
    Task<ApiResult<string>> SaveAsync(Message entity);
    Task DataWordSaveAsync(List<Message> messages);
    Task<ApiResult<string>> BatchDeleteAsync(List<int> ids);
    Task<ApiResult<string>> MarkReadAsync(List<int> ids);
    Task<ApiResult<List<MessageVo>>> QueryAsync(MessageQueryDto dto);
    Task<ApiResult<int>> GetUnreadCountAsync(int userId);
    Task<ApiResult<string>> ClearUserMessagesAsync(int userId);
    Task<ApiResult<string>> SendSystemMessageToAllAsync(string content);
}

