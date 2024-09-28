using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PatientManagementApp.Models
{
    public class BillingEntity
    {
        [Key]
        public int BillingId { get; set; }
        public int PatientId { get; set; }
        public PatientEntity? Patient { get; set; }
        public string PaymentMethod { get; set; }
        public int CurrentAmount { get; set; }
        public DateTime DateOfLastPayment { get; set; }
        public int RemainingAmount { get; set; }
        public string BillingStatus { get; set; }
        public DateTime CreatedAt { get; set; }

        public BillingEntity()
        {
            CreatedAt = DateTime.UtcNow;
            PaymentMethod = string.Empty;
            BillingStatus = string.Empty;
        }

        [JsonIgnore]
        [NotMapped]
        public string PatientFirstName
        {
            get
            {
                return Patient?.FirstName ?? string.Empty;
            }
        }

        [JsonIgnore]
        [NotMapped]
        public string PatientLastName
        {
            get
            {
                return Patient?.LastName ?? string.Empty;
            }
        }
    }
}
