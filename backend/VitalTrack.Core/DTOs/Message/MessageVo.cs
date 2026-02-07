namespace VitalTrack.Core.DTOs.Message;

public class MessageVo
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int MessageType { get; set; }
    public int ReceiverId { get; set; }
    public string? ReceiverName { get; set; }
    public int? SenderId { get; set; }
    public string? SenderName { get; set; }
    public bool IsRead { get; set; }
    public int? ContentId { get; set; }
    public DateTime CreateTime { get; set; }
}

