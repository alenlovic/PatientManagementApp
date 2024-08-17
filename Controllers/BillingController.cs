using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientManagementApp.Database;
using PatientManagementApp.Models;

namespace PatientManagementApp.Controllers
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
        public async Task<ActionResult<IEnumerable<BillingEntity>>> GetBilling()
        {
            return await _context.Billing.ToListAsync();
        }

        // GET: api/Billing/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BillingEntity>> GetBillingEntity(int id)
        {
            var billingEntity = await _context.Billing.FindAsync(id);

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

        // POST: api/Billing
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<BillingEntity>> PostBillingEntity(BillingEntity billingEntity)
        {
            _context.Billing.Add(billingEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBillingEntity", new { id = billingEntity.BillingId }, billingEntity);
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
