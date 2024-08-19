using System.ComponentModel.DataAnnotations;

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

        public string PatientFirstName
        {
            get
            {
                return Patient?.FirstName;
            }
        }

        public string PatientLastName
        {
            get
            {
                return Patient?.LastName;
            }
        }
    }
}
