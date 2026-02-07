using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.DTOs.User;

public class UserQueryDto : QueryDto
{
    public string? UserName { get; set; }
    public string? UserAccount { get; set; }
    public int? UserRole { get; set; }
}

