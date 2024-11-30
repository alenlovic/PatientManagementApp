using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientManagementApp.Database;
using PatientManagementApp.Models;

namespace PatientManagementApp.ApiControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BillingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Billing
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillingEntity>>> GetBilling(int? patientId = null)
        {
            return await _context.Billing
                .Include(b => b.Patient)
                .Where(b => patientId == null || b.PatientId == patientId)
                .ToListAsync();
        }

        // GET: api/Billing/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BillingEntity>> GetBillingEntity(int id)
        {
            var billingEntity = await _context.Billing
                .Include(p => p.Patient)
                .FirstOrDefaultAsync(b => b.BillingId == id);

            if (billingEntity == null)
            {
                return NotFound();
            }

            return billingEntity;
        }

        // PUT: api/Billing/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBillingEntity(int id, BillingEntity billingEntity)
        {
            if (id != billingEntity.BillingId)
            {
                return BadRequest();
            }

            _context.Entry(billingEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BillingEntityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public IActionResult CreateBilling([FromBody] BillingEntity billingEntity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Fetch the patient entity based on PatientId
            var patient = _context.Patients.Find(billingEntity.PatientId);

            if (patient == null)
            {
                return NotFound($"Patient with ID {billingEntity.PatientId} not found.");
            }

            // Assign the patient to the billing entity
            billingEntity.Patient = patient;

            // Now you can save the billing entity to the database
            _context.Billing.Add(billingEntity);
            _context.SaveChanges();

            return Ok(billingEntity);
        }

        // DELETE: api/Billing/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBillingEntity(int id)
        {
            var billingEntity = await _context.Billing.FindAsync(id);
            if (billingEntity == null)
            {
                return NotFound();
            }

            _context.Billing.Remove(billingEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BillingEntityExists(int id)
        {
            return _context.Billing.Any(e => e.BillingId == id);
        }

    }    

}
