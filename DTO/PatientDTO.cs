namespace PatientManagementApp.DTO
{
    public class PatientDTO
    {
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string FathersName { get; set; }
        public string LastName { get; set; }
        public string FullName { get => FirstName + " (" + FathersName + ") " + LastName; }
    }
}
