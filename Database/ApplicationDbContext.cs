using Microsoft.EntityFrameworkCore;
using PatientManagementApp.Models;

namespace PatientManagementApp.Database
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<PatientEntity> Patients { get; set; }
        public DbSet<PatientRecordEntity> PatientRecords { get; set; }
        public DbSet<BillingEntity> Billing { get; set; }
        public DbSet<PatientAppointmentEntity> PatientAppointmentEntity { get; set; }
        public DbSet<PatientFileEntity> PatientFiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PatientFileEntity>()
                .HasIndex(x => x.FileName)
                .IsUnique();
        }

        public override int SaveChanges()
        {
            foreach (var entry in ChangeTracker.Entries<PatientAppointmentEntity>())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    entry.Entity.AppointmentDate = entry.Entity.AppointmentDate.ToLocalTime();
                }
            }
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<PatientAppointmentEntity>())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    entry.Entity.AppointmentDate = entry.Entity.AppointmentDate.ToLocalTime();
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }


}
