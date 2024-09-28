using System.ComponentModel.DataAnnotations;

namespace PatientManagementApp.Models
{
    public class PatientAppointmentEntity
    {
        [Key]
        public int PatientAppointmentId { get; set; }
        public int PatientId { get; set; }
        public PatientEntity? Patient { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentNote { get; set; }
        public DateTime CreatedAt { get; set; }

        public PatientAppointmentEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }

        public string PatientPersonalName
        {
            get
            {
                return Patient?.PersonalName;
            }
        }
    }
}
