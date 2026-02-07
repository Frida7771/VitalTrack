using System.ComponentModel.DataAnnotations;

namespace VitalTrack.Core.DTOs.User;

public class UserRegisterDto
{
    [Required]
    [MaxLength(50)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string UserAccount { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string UserPwd { get; set; } = string.Empty;

    [EmailAddress]
    public string? UserEmail { get; set; }

    public string? UserAvatar { get; set; }
}

