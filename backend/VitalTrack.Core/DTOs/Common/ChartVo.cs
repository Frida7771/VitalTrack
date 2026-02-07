using System.Text.Json.Serialization;

namespace VitalTrack.Core.DTOs.Common;

public class ChartVo
{
    [JsonPropertyName("name")]
    public string Date { get; set; } = string.Empty;
    public int Count { get; set; }
}

