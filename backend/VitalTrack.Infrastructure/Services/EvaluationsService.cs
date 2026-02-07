using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.DTOs.Common;
using VitalTrack.Core.DTOs.Evaluations;
using VitalTrack.Core.Entities;
using VitalTrack.Core.Enums;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;

namespace VitalTrack.Infrastructure.Services;

public class EvaluationsService : IEvaluationsService
{
    private readonly HealthDbContext _context;
    private readonly IMessageService _messageService;

    public EvaluationsService(HealthDbContext context, IMessageService messageService)
    {
        _context = context;
        _messageService = messageService;
    }

    public async Task<ApiResult<string>> SaveAsync(int userId, Evaluations entity)
    {
        entity.CommenterId = userId;
        entity.CreateTime = DateTime.Now;
        entity.UpvoteList = string.Empty;
        _context.Evaluations.Add(entity);
        await _context.SaveChangesAsync();

        if (entity.ReplierId.HasValue && entity.ReplierId.Value != userId)
        {
            await _messageService.SaveAsync(new Message
            {
                Content = "有人回复了你的评论",
                MessageType = (int)MessageType.EvaluationsByReply,
                ReceiverId = entity.ReplierId.Value,
                SenderId = userId,
                ContentId = entity.Id,
                CreateTime = DateTime.Now
            });
        }
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> BatchDeleteAsync(List<int> ids)
    {
        var evaluations = await _context.Evaluations.Where(e => ids.Contains(e.Id)).ToListAsync();
        _context.Evaluations.RemoveRange(evaluations);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<string>> ToggleUpvoteAsync(int userId, int evaluationId)
    {
        var evaluation = await _context.Evaluations.FindAsync(evaluationId);
        if (evaluation == null) return ApiResult<string>.Error("评论不存在");

        var upvoteList = string.IsNullOrEmpty(evaluation.UpvoteList) 
            ? new List<string>() : evaluation.UpvoteList.Split(',').ToList();
        var userIdStr = userId.ToString();

        if (upvoteList.Contains(userIdStr))
        {
            upvoteList.Remove(userIdStr);
        }
        else
        {
            upvoteList.Add(userIdStr);
            if (evaluation.CommenterId != userId)
            {
                await _messageService.SaveAsync(new Message
                {
                    Content = "有人点赞了你的评论",
                    MessageType = (int)MessageType.EvaluationsByUpvote,
                    ReceiverId = evaluation.CommenterId,
                    SenderId = userId,
                    ContentId = evaluationId,
                    CreateTime = DateTime.Now
                });
            }
        }

        evaluation.UpvoteList = string.Join(",", upvoteList);
        await _context.SaveChangesAsync();
        return ApiResult<string>.Success();
    }

    public async Task<ApiResult<List<EvaluationsVo>>> QueryAsync(EvaluationsQueryDto dto)
    {
        var query = from e in _context.Evaluations
                    join c in _context.Users on e.CommenterId equals c.Id
                    join r in _context.Users on e.ReplierId equals r.Id into replierJoin
                    from r in replierJoin.DefaultIfEmpty()
                    where dto.ParentId.HasValue ? e.ParentId == dto.ParentId : e.ParentId == null
                    select new { Evaluation = e, Commenter = c, Replier = r };

        if (dto.CommenterId.HasValue) query = query.Where(x => x.Evaluation.CommenterId == dto.CommenterId.Value);
        if (!string.IsNullOrEmpty(dto.ContentType)) query = query.Where(x => x.Evaluation.ContentType == dto.ContentType);
        if (dto.ContentId.HasValue) query = query.Where(x => x.Evaluation.ContentId == dto.ContentId.Value);

        var total = await query.CountAsync();
        var rawData = await query.OrderByDescending(x => x.Evaluation.CreateTime).Skip(dto.Skip).Take(dto.Take)
            .Select(x => new 
            {
                x.Evaluation.Id, x.Evaluation.ParentId, x.Evaluation.CommenterId,
                CommenterName = x.Commenter.UserName, CommenterAvatar = x.Commenter.UserAvatar,
                x.Evaluation.ReplierId, ReplierName = x.Replier != null ? x.Replier.UserName : null,
                x.Evaluation.ContentType, x.Evaluation.Content, x.Evaluation.ContentId,
                x.Evaluation.UpvoteList,
                x.Evaluation.CreateTime
            }).ToListAsync();

        var data = rawData.Select(x => new EvaluationsVo
        {
            Id = x.Id, ParentId = x.ParentId, CommenterId = x.CommenterId,
            CommenterName = x.CommenterName, CommenterAvatar = x.CommenterAvatar,
            ReplierId = x.ReplierId, ReplierName = x.ReplierName,
            ContentType = x.ContentType, Content = x.Content, ContentId = x.ContentId,
            UpvoteList = x.UpvoteList,
            UpvoteCount = string.IsNullOrEmpty(x.UpvoteList) ? 0 : x.UpvoteList.Split(',').Length,
            CreateTime = x.CreateTime
        }).ToList();

        return ApiResult<List<EvaluationsVo>>.Success(data, total);
    }
}

