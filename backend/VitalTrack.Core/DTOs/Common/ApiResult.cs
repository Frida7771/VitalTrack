namespace VitalTrack.Core.DTOs.Common;

public class ApiResult<T>
{
    public int Code { get; set; }
    public string Msg { get; set; } = string.Empty;
    public T? Data { get; set; }
    public int? Total { get; set; }

    public static ApiResult<T> Success(T? data = default, string msg = "操作成功") => new()
    {
        Code = 200,
        Msg = msg,
        Data = data
    };

    public static ApiResult<T> Success(T? data, int total, string msg = "查询成功") => new()
    {
        Code = 200,
        Msg = msg,
        Data = data,
        Total = total
    };

    public static ApiResult<T> Error(string msg = "操作失败") => new()
    {
        Code = 500,
        Msg = msg
    };
}

public class ApiResult : ApiResult<object>
{
    public static ApiResult Success(string msg = "操作成功") => new() { Code = 200, Msg = msg };
    public static ApiResult Error(string msg = "操作失败") => new() { Code = 500, Msg = msg };
}

