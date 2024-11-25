using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientManagementApp.Database;
using PatientManagementApp.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

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

        // GET: api/PatientAppointment/appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime? date)
        {
            if (date == null)
            {
                return BadRequest(new { message = "Date parameter is required." });
            }

            var appointments = await _context.PatientAppointmentEntity
                .Include(a => a.Patient)
                .Where(a => a.AppointmentDate.Date == date.Value.Date)
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

        //[HttpGet("appointmentsbydate")]
        //public IActionResult GetAppointmentsByDate([FromQuery] DateTime? date)
        //{
        //    if (date == null)
        //    {
        //        return BadRequest(new { message = "Date parameter is required." });
        //    }

        //    try
        //    {
        //        var appointments = _context.PatientAppointmentEntity
        //            .Include(a => a.Patient)
        //            .Where(a => a.AppointmentDate.Date == date.Value.Date)
        //            .Select(a => new
        //            {
        //                a.AppointmentDate,
        //                PatientPersonalName = a.Patient != null ? a.Patient.PersonalName : "Unknown",
        //                a.AppointmentNote
        //            })
        //            .ToList();

        //        return Ok(appointments);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while retrieving appointments.", details = ex.Message });
        //    }
        //}

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

            // Ensure the appointment date is correctly handled
            patientAppointmentEntity.AppointmentDate = patientAppointmentEntity.AppointmentDate.Date;

            try
            {
                // Check if an appointment already exists for the same patient on the same date
                var existingAppointment = await _context.PatientAppointmentEntity
                    .FirstOrDefaultAsync(a => a.PatientId == patientAppointmentEntity.PatientId && a.AppointmentDate == patientAppointmentEntity.AppointmentDate);

                if (existingAppointment != null)
                {
                    return Conflict(new { message = "An appointment already exists for this patient on the specified date." });
                }

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
