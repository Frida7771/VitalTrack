namespace VitalTrack.Core.Enums;

public enum RoleEnum
{
    Admin = 1,
    User = 2
}

public static class RoleEnumExtensions
{
    public static string GetRoleName(this RoleEnum role) => role switch
    {
        RoleEnum.Admin => "管理员",
        RoleEnum.User => "用户",
        _ => string.Empty
    };
}

