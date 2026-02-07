using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitalTrack.Core.Entities;

[Table("message")]
public class Message
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("content")]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    [Column("message_type")]
    public int MessageType { get; set; }

    [Column("receiver_id")]
    public int ReceiverId { get; set; }

    [Column("sender_id")]
    public int? SenderId { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; }

    [Column("content_id")]
    public int? ContentId { get; set; }

    [Column("create_time")]
    public DateTime CreateTime { get; set; }

    [ForeignKey("ReceiverId")]
    public virtual User? Receiver { get; set; }

    [ForeignKey("SenderId")]
    public virtual User? Sender { get; set; }
}

