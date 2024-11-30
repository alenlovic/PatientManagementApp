using System.ComponentModel.DataAnnotations;

namespace PatientManagementApp.DTO.Requests
{
    public class PatientUpdateRequest
    {
        public int PatientId { get; set; }
        public DateTime YearOfBirth { get; set; }
        public string PlaceOfBirth { get; set; }
        public string PostalAddress { get; set; }
        public string PhoneNumber { get; set; }
        public long JMBG { get; set; }
        public string Email { get; set; }
        public bool IsCritical { get; set; }
        public string? PatientNote { get; set; }
    }
}
