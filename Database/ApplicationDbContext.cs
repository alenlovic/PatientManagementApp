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
    }


}
