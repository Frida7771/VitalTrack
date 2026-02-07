using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Message;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;

namespace VitalTrack.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly HealthDbContext _context;

    public MessageService(HealthDbContext context) => _context = context;

    public async Task<ApiResult<string>> SaveAsync(Message entity)
    {
        entity.CreateTime = DateTime.Now;
        entity.IsRead = false;
        _context.Messages.Add(entity);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task DataWordSaveAsync(List<Message> messages)
    {
        _context.Messages.AddRange(messages);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var messages = await _context.Messages.Where(m => ids.Contains(m.Id)).ToListAsync();
        _context.Messages.RemoveRange(messages);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> MarkReadAsync(List<int> ids)
    {
        var messages = await _context.Messages.Where(m => ids.Contains(m.Id)).ToListAsync();
        foreach (var m in messages) m.IsRead = true;
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<MessageVo>>> QueryAsync(MessageQueryDto dto)
    {
        var query = from m in _context.Messages
                    join r in _context.Users on m.ReceiverId equals r.Id
                    join s in _context.Users on m.SenderId equals s.Id into senderJoin
                    from s in senderJoin.DefaultIfEmpty()
                    select new { Message = m, Receiver = r, Sender = s };

        if (dto.ReceiverId.HasValue) query = query.Where(x => x.Message.ReceiverId == dto.ReceiverId.Value);
        if (dto.SenderId.HasValue) query = query.Where(x => x.Message.SenderId == dto.SenderId.Value);
        if (dto.MessageType.HasValue) query = query.Where(x => x.Message.MessageType == dto.MessageType.Value);
        if (dto.IsRead.HasValue) query = query.Where(x => x.Message.IsRead == dto.IsRead.Value);

        var total = await query.CountAsync();
        var data = await query.OrderByDescending(x => x.Message.CreateTime).Skip(dto.Skip).Take(dto.Take)
            .Select(x => new MessageVo
            {
                Id = x.Message.Id, Content = x.Message.Content, MessageType = x.Message.MessageType,
                ReceiverId = x.Message.ReceiverId, ReceiverName = x.Receiver.UserName,
                SenderId = x.Message.SenderId, SenderName = x.Sender != null ? x.Sender.UserName : null,
                IsRead = x.Message.IsRead, ContentId = x.Message.ContentId, CreateTime = x.Message.CreateTime
            }).ToListAsync();

        return ApiResult<List<MessageVo>>.Success(data, total);
    }

    public async Task<ApiResult<int>> GetUnreadCountAsync(int userId) =>
        ApiResult<int>.Success(await _context.Messages.CountAsync(m => m.ReceiverId == userId && !m.IsRead));

    public async Task<ApiResult<string>> ClearUserMessagesAsync(int userId)
    {
        var messages = await _context.Messages.Where(m => m.ReceiverId == userId).ToListAsync();
        foreach (var m in messages) m.IsRead = true;
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> SendSystemMessageToAllAsync(string content)
    {
        var users = await _context.Users.Select(u => u.Id).ToListAsync();
        var now = DateTime.Now;
        var messages = users.Select(userId => new Message
        {
            Content = content,
            MessageType = 4,
            ReceiverId = userId,
            IsRead = false,
            CreateTime = now
        }).ToList();
        _context.Messages.AddRange(messages);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }
}

