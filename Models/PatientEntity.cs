using System.ComponentModel.DataAnnotations;

namespace PatientManagementApp.Models
{
    public class PatientEntity
    {
        [Key]
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string FathersName { get; set; }
        public string LastName { get; set; }
        public string PersonalName { get => FirstName + " " + LastName; }
        public string FullName { get => FirstName + " (" + FathersName +  ") " + LastName; }
        public DateTime YearOfBirth { get; set; }
        public string PlaceOfBirth { get; set; }
        public string PostalAddress { get; set; }
        public string PhoneNumber { get; set; }
        public long JMBG { get; set; } 
        public string Email { get; set; }
        public bool IsCritical { get; set; }
        public string PatientNote { get; set; }
        public DateTime CreatedAt { get; set; }

        public PatientEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
}
