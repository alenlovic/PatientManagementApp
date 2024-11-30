using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return RedirectToAction(nameof(DailyScheduleController.Index), "DailySchedule");
        }
    }
}
