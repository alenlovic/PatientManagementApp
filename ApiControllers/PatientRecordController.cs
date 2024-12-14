using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using PatientManagementApp.Database;
using PatientManagementApp.Models;

namespace PatientManagementApp.ApiControllers
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
            return await _context
                .PatientRecords
                .ToListAsync();
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
        // GET: api/PatientRecord/ByPatientId/5
        [HttpGet("ByPatientId/{patientId}")]
        public async Task<ActionResult<PatientRecordEntity>> GetPatientRecordEntityByPatientId(int patientId)
        {
            var patientRecordEntity = await _context.PatientRecords.FirstOrDefaultAsync(x => x.PatientId == patientId);

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
        [HttpPost]
        public async Task<IActionResult> CreatePatientRecord([FromBody] PatientRecordEntity patientRecord)
        {
            if (patientRecord == null)
            {
                return BadRequest("Patient record data is null.");
            }

            try
            {
                _context.PatientRecords.Add(patientRecord);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetPatientRecordEntity), new { id = patientRecord.PatientRecordId }, patientRecord);
            }
            catch (Exception ex)
            {
                // Log the exception (ex) here for debugging purposes
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
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

        // PATCH: api/PatientRecord/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchPatientRecordEntity(int id, [FromBody] JsonPatchDocument<PatientRecordEntity> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var patientRecordEntity = await _context.PatientRecords.FindAsync(id);
            if (patientRecordEntity == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(patientRecordEntity, ModelState);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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

        private bool PatientRecordEntityExists(int id)
        {
            return _context.PatientRecords.Any(e => e.PatientRecordId == id);
        }
    }
}
