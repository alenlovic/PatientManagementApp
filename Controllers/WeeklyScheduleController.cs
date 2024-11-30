using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class WeeklyScheduleController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
