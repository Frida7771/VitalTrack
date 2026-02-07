using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitalTrack.Core.Entities;

[Table("user")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_account")]
    [MaxLength(50)]
    public string UserAccount { get; set; } = string.Empty;

    [Column("user_name")]
    [MaxLength(50)]
    public string UserName { get; set; } = string.Empty;

    [Column("user_pwd")]
    [MaxLength(100)]
    public string UserPwd { get; set; } = string.Empty;

    [Column("user_avatar")]
    [MaxLength(255)]
    public string? UserAvatar { get; set; }

    [Column("user_email")]
    [MaxLength(100)]
    public string? UserEmail { get; set; }

    [Column("user_role")]
    public int UserRole { get; set; }

    [Column("is_login")]
    public bool IsLogin { get; set; }

    [Column("is_word")]
    public bool IsWord { get; set; }

    [Column("create_time")]
    public DateTime CreateTime { get; set; }
}

