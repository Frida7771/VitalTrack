using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitalTrack.Core.Entities;

[Table("evaluations")]
public class Evaluations
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }

    [Column("commenter_id")]
    public int CommenterId { get; set; }

    [Column("replier_id")]
    public int? ReplierId { get; set; }

    [Column("content_type")]
    [MaxLength(50)]
    public string? ContentType { get; set; }

    [Column("content")]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    [Column("content_id")]
    public int? ContentId { get; set; }

    [Column("upvote_list")]
    [MaxLength(2000)]
    public string? UpvoteList { get; set; }

    [Column("create_time")]
    public DateTime CreateTime { get; set; }

    [ForeignKey("CommenterId")]
    public virtual User? Commenter { get; set; }

    [ForeignKey("ReplierId")]
    public virtual User? Replier { get; set; }

    [ForeignKey("ParentId")]
    public virtual Evaluations? Parent { get; set; }
}

