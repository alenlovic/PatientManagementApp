using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PatientManagementApp.Database;
using PatientManagementApp.DTO.Requests;
using PatientManagementApp.Models;

namespace PatientManagementApp.ApiControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Patient
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientEntity>>> GetPatients()
        {
            return await _context.Patients.ToListAsync();
        }

        // GET: api/Patients?name=John
        [HttpGet("search")]
        public IActionResult GetPatientsBySearch([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Name query parameter is required.");
            }

            var trimmedName = name.Trim().ToLower();
            var patients = _context.Patients
                .Where(p => p.FirstName.ToLower().Contains(trimmedName) ||
                            p.LastName.ToLower().Contains(trimmedName) ||
                            (p.FirstName + " " + p.LastName).ToLower().Contains(trimmedName))
                .Select(p => new
                {
                    p.PatientId,
                    PersonalName = p.FirstName + " " + p.LastName
                })
                .ToList();

            return Ok(patients);
        }



        // GET: api/Patients/name/John
        [HttpGet("name/{name}")]
        public IActionResult GetPatientsByName(string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Name parameter is required.");
            }

            var patients = _context.Patients
                .Where(p => p.FirstName.Contains(name) || p.LastName.Contains(name))
                .Select(p => new
                {
                    p.PatientId,
                    p.FirstName,
                    p.LastName,
                    p.FullName,
                    p.YearOfBirth,
                    p.PlaceOfBirth,
                    p.PostalAddress,
                    p.PhoneNumber,
                    p.JMBG,
                    p.Email,
                    p.IsCritical,
                    p.PatientNote
                })
                .ToList();

            return Ok(patients);
        }

        // GET: api/Patient/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientEntity>> GetPatientEntity(int id)
        {
            var patientEntity = await _context.Patients.FindAsync(id);

            if (patientEntity == null)
            {
                return NotFound();
            }

            return patientEntity;
        }

        // PUT: api/Patient/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatientEntity(int id, PatientUpdateRequest patientEntity)
        {
            if (id != patientEntity.PatientId)
            {
                return BadRequest();
            }

            var patient = _context.Patients.Find(id);
            if (patient == null)
            {
                return NotFound();
            }

            patient.YearOfBirth = patientEntity.YearOfBirth;
            patient.PlaceOfBirth = patientEntity.PlaceOfBirth;
            patient.PostalAddress = patientEntity.PostalAddress;
            patient.PhoneNumber = patientEntity.PhoneNumber;
            patient.JMBG = patientEntity.JMBG;
            patient.Email = patientEntity.Email;
            patient.IsCritical = patientEntity.IsCritical;
            patient.PatientNote = patientEntity.PatientNote;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientEntityExists(id))
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

        // POST: api/Patient
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PatientEntity>> PostPatientEntity(PatientEntity patientEntity)
        {
            _context.Patients.Add(patientEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPatientEntity", new { id = patientEntity.PatientId }, patientEntity);
        }

        // DELETE: api/Patient/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatientEntity(int id)
        {
            var patientEntity = await _context.Patients.FindAsync(id);
            if (patientEntity == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patientEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientEntityExists(int id)
        {
            return _context.Patients.Any(e => e.PatientId == id);
        }

        //PATCH: api/Patient/id
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdatePatientCriticalStatus(int id, [FromBody] JsonPatchDocument<PatientEntity> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(patient, ModelState);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
