using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class MonthlyScheduleController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
