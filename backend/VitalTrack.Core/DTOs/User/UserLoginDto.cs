using System.ComponentModel.DataAnnotations;

namespace VitalTrack.Core.DTOs.User;

public class UserLoginDto
{
    [Required(ErrorMessage = "账号不能为空")]
    public string UserAccount { get; set; } = string.Empty;

    [Required(ErrorMessage = "密码不能为空")]
    public string UserPwd { get; set; } = string.Empty;
}

