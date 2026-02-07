using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Core.DTOs.Message;

public class MessageQueryDto : QueryDto
{
    public int? ReceiverId { get; set; }
    public int? SenderId { get; set; }
    public int? MessageType { get; set; }
    public bool? IsRead { get; set; }
}

