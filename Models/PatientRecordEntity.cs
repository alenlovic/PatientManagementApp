using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PatientManagementApp.Models
{
    public class PatientRecordEntity
    {
        [Key]
        public int PatientRecordId { get; set; }
        public int PatientId { get; set; }
        public PatientEntity? Patient { get; set; }
        public string DentalProsthetics { get; set; }
        public string PreviousDiseases { get; set; }
        public string ChronicDiseases { get; set; }
        public string Allergies { get; set; }
        public string PenicilinAllergy { get; set; }
        public string RecordNote { get; set; }
        public DateTime CreatedAt { get; set; }

        public PatientRecordEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
}
