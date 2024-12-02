using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PatientManagementApp.Models
{
    public class PatientAppointmentEntity
    {
        [Key]
        public int PatientAppointmentId { get; set; }
        public int PatientId { get; set; }
        public PatientEntity? Patient { get; set; }
        public DateTimeOffset AppointmentDate { get; set; }
        public string AppointmentNote { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }

        public PatientAppointmentEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }

        public string PatientPersonalName
        {
            get
            {
                return Patient?.PersonalName ?? string.Empty;
            }
        }
    }
}
