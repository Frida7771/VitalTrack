using System.ComponentModel.DataAnnotations;

namespace VitalTrack.Core.DTOs.UserHealth;

public class UserHealthSaveDto
{
    [Required]
    public int HealthModelConfigId { get; set; }

    [Required]
    public string Value { get; set; } = string.Empty;
}

