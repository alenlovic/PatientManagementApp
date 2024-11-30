using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class PatientsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Add()
        {
            return View();
        }
        public IActionResult Profile(int id)
        {
            return View(id);
        }
    }
}
