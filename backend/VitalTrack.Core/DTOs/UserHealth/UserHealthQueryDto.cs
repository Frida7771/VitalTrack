using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.DTOs.UserHealth;

public class UserHealthQueryDto : QueryDto
{
    public int? UserId { get; set; }
    public int? HealthModelConfigId { get; set; }
}

