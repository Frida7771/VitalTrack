using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitalTrack.Core.Entities;

[Table("health_model_config")]
public class HealthModelConfig
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("detail")]
    [MaxLength(500)]
    public string? Detail { get; set; }

    [Column("cover")]
    [MaxLength(255)]
    public string? Cover { get; set; }

    [Column("unit")]
    [MaxLength(20)]
    public string? Unit { get; set; }

    [Column("symbol")]
    [MaxLength(20)]
    public string? Symbol { get; set; }

    [Column("value_range")]
    [MaxLength(50)]
    public string? ValueRange { get; set; }

    [Column("is_global")]
    public bool IsGlobal { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}

