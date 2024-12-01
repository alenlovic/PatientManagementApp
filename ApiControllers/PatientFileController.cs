using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using PatientManagementApp.Database;
using PatientManagementApp.DTO.Requests;
using PatientManagementApp.Models;

namespace PatientManagementApp.ApiControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientFileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public PatientFileController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/PatientFile
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientFileEntity>>> GetPatientFiles()
        {
            return await _context.PatientFiles.ToListAsync();
        }

        // GET: api/PatientFile/5
        [HttpGet("preview/{fileName:guid}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK, "image/jpeg")]
        public async Task<ActionResult<PatientFileEntity>> DownloadFile(Guid fileName, bool download = false)
        {
            var patientFile = await _context.PatientFiles.FirstOrDefaultAsync(x => x.FileName == fileName);
            if (patientFile == null)
            {
                return NotFound();
            }

            var filePath = Path.Combine(_environment.WebRootPath, "PatientFiles", patientFile.FileName.ToString());
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            if (download)
            {
                return File(memory, "image/jpeg", patientFile.FileOriginalName);
            }
            return File(memory, "image/jpeg");
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
        public async Task<ActionResult<PatientFileEntity>> UploadRtg([FromForm] UploadRTGRequest request)
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Save the fileBytes to the database associated with the patientId
            var patient = await _context.Patients.FindAsync(request.PatientId);
            if (patient == null)
            {
                return NotFound("Patient not found.");
            }

            var patientFile = new PatientFileEntity
            {
                PatientId = request.PatientId,
                FileName = Guid.NewGuid(),
                FileOriginalName = request.File.FileName,
                UploadedAt = DateTime.Now
            };
            _context.PatientFiles.Add(patientFile);

            await _context.SaveChangesAsync();

            var filePath = Path.Combine(_environment.WebRootPath, "PatientFiles", patientFile.FileName.ToString());
            if (System.IO.File.Exists(filePath))
            {
                return StatusCode(500);
            }

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(fileStream);
            }

            return Ok(patientFile);
        }

        // DELETE: api/PatientFile/5
        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeletePatientFileEntity(Guid fileId)
        {
            var patientFileEntity = await _context.PatientFiles.FindAsync(fileId);
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
