using Microsoft.EntityFrameworkCore;
using Student_project_man.Models;

namespace Student_project_man.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<SPM_Role> Roles { get; set; }
        public DbSet<SPM_User> Users { get; set; }
        public DbSet<SPM_UserRole> UserRoles { get; set; }
        public DbSet<SPM_Status> Statuses { get; set; }
        public DbSet<SPM_Priority> Priorities { get; set; }
        public DbSet<SPM_Project> Projects { get; set; }
        public DbSet<SPM_Task> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SPM_User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
