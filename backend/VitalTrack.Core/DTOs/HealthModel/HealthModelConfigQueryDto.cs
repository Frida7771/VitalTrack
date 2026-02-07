using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.DTOs.HealthModel;

public class HealthModelConfigQueryDto : QueryDto
{
    public int? UserId { get; set; }
    public string? Name { get; set; }
    public bool? IsGlobal { get; set; }
}

