using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace VitalTrack.Infrastructure.Utils;

public class JwtUtil
{
    private readonly string _secretKey;
    private readonly int _expirationDays;

    public JwtUtil(IConfiguration configuration)
    {
        _secretKey = configuration["Jwt:SecretKey"] ?? "d8c986df-8512-42b5-906f-eeea9b3acf86";
        _expirationDays = int.Parse(configuration["Jwt:ExpirationDays"] ?? "7");
    }

    public string GenerateToken(int userId, int role)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id", userId.ToString()),
            new Claim("role", role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: "VitalTrack",
            audience: "VitalTrack",
            claims: claims,
            expires: DateTime.Now.AddDays(_expirationDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

