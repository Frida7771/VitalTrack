namespace VitalTrack.Core.DTOs.User;

public class UserVo
{
    public int Id { get; set; }
    public string UserAccount { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public string? UserEmail { get; set; }
    public int UserRole { get; set; }
    public bool IsLogin { get; set; }
    public bool IsWord { get; set; }
    public DateTime CreateTime { get; set; }
}

