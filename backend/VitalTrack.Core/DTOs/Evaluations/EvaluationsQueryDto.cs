using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.DTOs.Evaluations;

public class EvaluationsQueryDto : QueryDto
{
    public int? CommenterId { get; set; }
    public string? ContentType { get; set; }
    public int? ContentId { get; set; }
    public int? ParentId { get; set; }
}

