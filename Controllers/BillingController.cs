﻿using Microsoft.AspNetCore.Mvc;

namespace PatientManagementApp.Controllers
{
    public class BillingController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
