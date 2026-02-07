namespace VitalTrack.Core.DTOs.Common;

public class QueryDto
{
    public int? Id { get; set; }
    public int? Current { get; set; }
    public int? Size { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int Skip => ((Current ?? 1) - 1) * (Size ?? 10);
    public int Take => Size ?? 10;
}

