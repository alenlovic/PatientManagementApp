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
    public class PatientAppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientAppointmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientAppointment/appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTimeOffset? date)
        {
            if (date == null)
            {
                return BadRequest(new { message = "Date parameter is required." });
            }

            var localDate = new DateTimeOffset(date.Value.Date, TimeSpan.Zero).ToLocalTime();

            var appointments = await _context.PatientAppointmentEntity
                .Include(a => a.Patient)
                .Where(a => a.AppointmentDate.Date == localDate.Date)
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/PatientAppointment/appointments/5
        [HttpGet("appointments/{id}")]
        public async Task<ActionResult<PatientAppointmentEntity>> GetAppointmentById(int id)
        {
            var appointment = await _context.PatientAppointmentEntity
                .Include(a => a.Patient) 
                .FirstOrDefaultAsync(a => a.PatientAppointmentId == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
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

        // POST: api/PatientAppointment/appointments
        [HttpPost("appointments")]
        public async Task<ActionResult<PatientAppointmentEntity>> PostPatientAppointmentEntity(PatientAppointmentEntity patientAppointmentEntity)
        {
            var patient = await _context.Patients.FindAsync(patientAppointmentEntity.PatientId);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            try
            {
                // Check if an appointment already exists for the same patient on the same date
                var existingAppointment = await _context.PatientAppointmentEntity
                    .FirstOrDefaultAsync(a => a.PatientId == patientAppointmentEntity.PatientId && a.AppointmentDate == patientAppointmentEntity.AppointmentDate);

                if (existingAppointment != null)
                {
                    return Conflict(new { message = "An appointment already exists for this patient on the specified date." });
                }

                patientAppointmentEntity.AppointmentDate = new DateTimeOffset(patientAppointmentEntity.AppointmentDate.DateTime, TimeSpan.FromHours(1));


                _context.PatientAppointmentEntity.Add(patientAppointmentEntity);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAppointmentById), new { id = patientAppointmentEntity.PatientAppointmentId }, patientAppointmentEntity);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while creating the appointment.", details = ex.Message });
            }
        }


        // DELETE: api/PatientAppointment/5
        [HttpDelete("appointments/{id}")]
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
