using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PatientManagementApp.Models
{
    public class PatientFileEntity
    {
        [Key]
        public int PatientFileId { get; set; }
        public int PatientId { get; set; }
        public PatientEntity? Patient { get; set; }
        public Guid FileName { get; set; }
        public string FileOriginalName { get; set; }
        public DateTime UploadedAt { get; set; }

        public PatientFileEntity()
        {
            UploadedAt = DateTime.UtcNow;
        }
    }
}
