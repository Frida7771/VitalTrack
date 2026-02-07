using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitalTrack.Core.Entities;

[Table("user_health")]
public class UserHealth
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("health_model_config_id")]
    public int HealthModelConfigId { get; set; }

    [Column("value")]
    [MaxLength(50)]
    public string Value { get; set; } = string.Empty;

    [Column("create_time")]
    public DateTime CreateTime { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    [ForeignKey("HealthModelConfigId")]
    public virtual HealthModelConfig? HealthModelConfig { get; set; }
}

