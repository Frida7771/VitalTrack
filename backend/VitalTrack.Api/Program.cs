using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using VitalTrack.Core.Interfaces;
using VitalTrack.Infrastructure.Data;
using VitalTrack.Infrastructure.Services;
using VitalTrack.Infrastructure.Utils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VitalTrack API",
        Version = "v1.0",
        Description = "VitalTrack - 个人健康追踪管理系统 API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 配置MySQL数据库
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<HealthDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 配置JWT认证
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "d8c986df-8512-42b5-906f-eeea9b3acf86";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ValidateIssuer = true,
            ValidIssuer = "VitalTrack",
            ValidateAudience = true,
            ValidAudience = "VitalTrack",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// 配置授权策略
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy =>
        policy.RequireClaim("role", "1"));
});

// 注册服务
builder.Services.AddSingleton<JwtUtil>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserHealthService, UserHealthService>();
builder.Services.AddScoped<IHealthModelConfigService, HealthModelConfigService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IEvaluationsService, EvaluationsService>();
builder.Services.AddScoped<ITagsService, TagsService>();
builder.Services.AddScoped<IFileService, FileService>();

// 配置CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 确保数据库创建
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HealthDbContext>();
    dbContext.Database.EnsureCreated();
}

app.Run();

