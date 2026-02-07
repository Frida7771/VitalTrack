namespace VitalTrack.Core.DTOs.Evaluations;

public class EvaluationsVo
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public int CommenterId { get; set; }
    public string? CommenterName { get; set; }
    public string? CommenterAvatar { get; set; }
    public int? ReplierId { get; set; }
    public string? ReplierName { get; set; }
    public string? ContentType { get; set; }
    public string Content { get; set; } = string.Empty;
    public int? ContentId { get; set; }
    public string? UpvoteList { get; set; }
    public int UpvoteCount { get; set; }
    public DateTime CreateTime { get; set; }
    public List<EvaluationsVo> Children { get; set; } = new();
}

