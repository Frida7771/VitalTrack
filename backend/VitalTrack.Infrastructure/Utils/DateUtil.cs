using VitalTrack.Core.DTOs.Common;

namespace VitalTrack.Infrastructure.Utils;

public static class DateUtil
{
    public static List<ChartVo> CountDatesWithinRange(int days, List<DateTime> dates)
    {
        var result = new List<ChartVo>();
        var endDate = DateTime.Now.Date;
        var startDate = endDate.AddDays(-days + 1);

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            result.Add(new ChartVo
            {
                Date = date.ToString("yyyy-MM-dd"),
                Count = dates.Count(d => d.Date == date)
            });
        }
        return result;
    }

    public static (DateTime StartTime, DateTime EndTime) GetStartAndEndTime(int days)
    {
        return (DateTime.Now.AddDays(-days), DateTime.Now);
    }
}

