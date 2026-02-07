namespace VitalTrack.Core.DTOs.HealthModel;

public class HealthModelConfigVo
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public string? Cover { get; set; }
    public string? Unit { get; set; }
    public string? Symbol { get; set; }
    public string? ValueRange { get; set; }
    public bool IsGlobal { get; set; }
}

