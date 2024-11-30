namespace PatientManagementApp.DTO.Requests
{
    public class UploadRTGRequest
    {
        public int PatientId { get; set; }
        public required IFormFile File { get; set; }
    }
}
