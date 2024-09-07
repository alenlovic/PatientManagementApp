using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using PatientManagementApp.Database;
using PatientManagementApp.Models;

namespace PatientManagementApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientRecordController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientRecordController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientRecord
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientRecordEntity>>> GetPatientRecords()
        {
            return await _context.PatientRecords.ToListAsync();
        }

        // GET: api/PatientRecord/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientRecordEntity>> GetPatientRecordEntity(int id)
        {
            var patientRecordEntity = await _context.PatientRecords.FindAsync(id);

            if (patientRecordEntity == null)
            {
                return NotFound();
            }

            return patientRecordEntity;
        }

        // PUT: api/PatientRecord/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatientRecordEntity(int id, PatientRecordEntity patientRecordEntity)
        {
            if (id != patientRecordEntity.PatientRecordId)
            {
                return BadRequest();
            }

            _context.Entry(patientRecordEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientRecordEntityExists(id))
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

        // POST: api/PatientRecord
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<IActionResult> CreatePatientRecord(string patientRecord, [FromBody] IFormFile? opgImageFile)
        {
            if (string.IsNullOrEmpty(patientRecord))
            {
                return BadRequest("Patient record data is required.");
            }

            var patientRecordEntity = JsonConvert.DeserializeObject<PatientRecordEntity>(patientRecord);

            if (patientRecordEntity == null)
            {
                return BadRequest("Invalid patient record data.");
            }

            if (opgImageFile != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await opgImageFile.CopyToAsync(memoryStream);
                    patientRecordEntity.OPG = memoryStream.ToArray();
                }
            }
            else
            {
                patientRecordEntity.OPG = null;
            }

            _context.PatientRecords.Add(patientRecordEntity);
            await _context.SaveChangesAsync();

            return Ok(patientRecordEntity);
        }

        // DELETE: api/PatientRecord/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatientRecordEntity(int id)
        {
            var patientRecordEntity = await _context.PatientRecords.FindAsync(id);
            if (patientRecordEntity == null)
            {
                return NotFound();
            }

            _context.PatientRecords.Remove(patientRecordEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientRecordEntityExists(int id)
        {
            return _context.PatientRecords.Any(e => e.PatientRecordId == id);
        }
    }
}
