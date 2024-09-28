using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PatientManagementApp.Models
{
    public class PatientFileEntity
    {
        [Key]
        public int PatientFileId { get; set; }
        public int PatientRecordId { get; set; }
        public PatientRecordEntity? PatientRecord { get; set; }
        public byte[]? OPG { get; set; }
        public DateTime UploadedAt { get; set; }

        public PatientFileEntity()
        {
            UploadedAt = DateTime.UtcNow;
        }
    }
}
