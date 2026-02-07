namespace VitalTrack.Core.DTOs.UserHealth;

public class UserHealthVo
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int HealthModelConfigId { get; set; }
    public string? HealthModelName { get; set; }
    public string? Unit { get; set; }
    public string? Symbol { get; set; }
    public string? ValueRange { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTime CreateTime { get; set; }
}

