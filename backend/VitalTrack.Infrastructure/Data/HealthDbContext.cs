using Microsoft.EntityFrameworkCore;
using VitalTrack.Core.Entities;

namespace VitalTrack.Infrastructure.Data;

public class HealthDbContext : DbContext
{
    public HealthDbContext(DbContextOptions<HealthDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserHealth> UserHealths { get; set; } = null!;
    public DbSet<HealthModelConfig> HealthModelConfigs { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Evaluations> Evaluations { get; set; } = null!;
    public DbSet<Tags> Tags { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.UserAccount).IsUnique();
            entity.HasIndex(e => e.UserName);
        });

        modelBuilder.Entity<UserHealth>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.HealthModelConfigId);
        });

        modelBuilder.Entity<HealthModelConfig>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsGlobal);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasIndex(e => e.ReceiverId);
            entity.HasIndex(e => e.IsRead);
        });

        modelBuilder.Entity<Evaluations>(entity =>
        {
            entity.HasIndex(e => e.CommenterId);
            entity.HasIndex(e => e.ContentId);
        });
    }
}

