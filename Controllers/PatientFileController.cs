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
    public class PatientFileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientFileController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientFile
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientFileEntity>>> GetPatientFiles()
        {
            return await _context.PatientFiles.ToListAsync();
        }

        // GET: api/PatientFile/5
        [HttpGet("download/{id}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK, "image/jpeg")]
        public async Task<ActionResult<PatientFileEntity>> DownloadFile(int id)
        {
            var patientFile = await _context.PatientFiles.FindAsync(id);
            if (patientFile == null || patientFile.OPG == null)
            {
                return NotFound();
            }

            return File(patientFile.OPG, "application/octet-stream", $"RTG_{id}.jpg");
        }

        // PUT: api/PatientFile/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatientFileEntity(int id, PatientFileEntity patientFileEntity)
        {
            if (id != patientFileEntity.PatientFileId)
            {
                return BadRequest();
            }

            _context.Entry(patientFileEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientFileEntityExists(id))
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

        // POST: api/PatientFile
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("uploadRtg")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PatientFileEntity>> UploadRtg([FromBody] int PatientRecordId, IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var patientFile = new PatientFileEntity
            {
                PatientRecordId = PatientRecordId,
                OPG = memoryStream.ToArray(),
                UploadedAt = DateTime.UtcNow
            };

            _context.PatientFiles.Add(patientFile);
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = $"/api/PatientFile/{patientFile.PatientFileId}" });
        }

        // DELETE: api/PatientFile/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatientFileEntity(int id)
        {
            var patientFileEntity = await _context.PatientFiles.FindAsync(id);
            if (patientFileEntity == null)
            {
                return NotFound();
            }

            _context.PatientFiles.Remove(patientFileEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientFileEntityExists(int id)
        {
            return _context.PatientFiles.Any(e => e.PatientFileId == id);
        }
    }
}
