using System.ComponentModel.DataAnnotations;

namespace VitalTrack.Core.DTOs.User;

public class UpdatePwdDto
{
    [Required]
    public string OldPwd { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPwd { get; set; } = string.Empty;
}

