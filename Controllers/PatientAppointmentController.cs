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
    public class PatientAppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientAppointmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientAppointment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientAppointmentEntity>>> GetPatientAppointmentEntity()
        {
            return await _context.PatientAppointmentEntity.ToListAsync();
        }

        // GET: api/PatientAppointment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientAppointmentEntity>> GetPatientAppointmentEntity(int id)
        {
            var patientAppointmentEntity = await _context.PatientAppointmentEntity.FindAsync(id);

            if (patientAppointmentEntity == null)
            {
                return NotFound();
            }

            return patientAppointmentEntity;
        }

        [HttpGet("appointments")]
        public IActionResult GetAppointmentsByDate([FromQuery] DateTime date)
        {
            var appointments = _context.PatientAppointmentEntity
                .Where(a => a.AppointmentDate.Date == date.Date)
                .Select(a => new
                {
                    a.AppointmentDate,
                    PatientName = a.Patient.PersonalName,
                    a.AppointmentNote
                })
                .ToList();

            return Ok(appointments);
        }

        // PUT: api/PatientAppointment/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatientAppointmentEntity(int id, PatientAppointmentEntity patientAppointmentEntity)
        {
            if (id != patientAppointmentEntity.PatientAppointmentId)
            {
                return BadRequest();
            }

            _context.Entry(patientAppointmentEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientAppointmentEntityExists(id))
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

        // POST: api/PatientAppointment
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PatientAppointmentEntity>> PostPatientAppointmentEntity(PatientAppointmentEntity patientAppointmentEntity)
        {
            _context.PatientAppointmentEntity.Add(patientAppointmentEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPatientAppointmentEntity", new { id = patientAppointmentEntity.PatientAppointmentId }, patientAppointmentEntity);
        }

        // DELETE: api/PatientAppointment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatientAppointmentEntity(int id)
        {
            var patientAppointmentEntity = await _context.PatientAppointmentEntity.FindAsync(id);
            if (patientAppointmentEntity == null)
            {
                return NotFound();
            }

            _context.PatientAppointmentEntity.Remove(patientAppointmentEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientAppointmentEntityExists(int id)
        {
            return _context.PatientAppointmentEntity.Any(e => e.PatientAppointmentId == id);
        }
    }
}
