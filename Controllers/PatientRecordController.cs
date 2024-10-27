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

        //GET: api/PatientRecord/{id}/opg
        [HttpGet("opg/{patientRecordId}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK, "image/jpeg")]
        public async Task<IActionResult> GetOpgImageFile(int id)
        {
            var opgFile = await _context.PatientFiles.FirstOrDefaultAsync(pf => pf.PatientRecordId == id);
            if(opgFile == null || opgFile.OPG == null)
            {
                return NotFound("OPG image not found.");
            }

            return File(opgFile.OPG, "image/jpg");
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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreatePatientRecord([FromBody] PatientRecordEntity patientRecord, IFormFile? opgImageFile)
        {
            if (patientRecord == null)
            {
                return BadRequest("Patient record data is null.");
            }

            if (opgImageFile != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await opgImageFile.CopyToAsync(memoryStream);
                    var patientFile = new PatientFileEntity
                    {
                        PatientRecordId = patientRecord.PatientRecordId,
                        OPG = memoryStream.ToArray()
                    };

                    _context.PatientFiles.Add(patientFile);
                    await _context.SaveChangesAsync();
                }
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

        [HttpPost("{id}/upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadOpgImageFile(int id, IFormFile? file)
        {
            var patientRecord = await _context.PatientRecords.FindAsync(id);
            if (patientRecord == null)
            {
                return NotFound("Patient record not found.");
            }

            if (file == null)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    var patientFile = new PatientFileEntity
                    {
                        PatientRecordId = id,
                        OPG = memoryStream.ToArray()
                    };

                    _context.PatientFiles.Add(patientFile);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "File uploaded successfully" });
            }
            catch (Exception ex)
            {
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

        private bool PatientRecordEntityExists(int id)
        {
            return _context.PatientRecords.Any(e => e.PatientRecordId == id);
        }
    }
}
