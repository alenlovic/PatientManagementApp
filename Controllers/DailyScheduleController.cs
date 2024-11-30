using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class DailyScheduleController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
