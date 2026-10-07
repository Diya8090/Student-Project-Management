using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_project_man.Common;
using Student_project_man.Data;
using Student_project_man.DTOs;
using Student_project_man.Models;

namespace Student_project_man.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StatusController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditStatusDTO> _validator;

        public StatusController(
            AppDbContext context,
            IValidator<AddEditStatusDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // Admin + Faculty + Student
        // GET: api/Status
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<IEnumerable<GetStatusDTO>>> GetStatuses()
        {
            var statuses = await _context.Statuses
                .Select(s => new GetStatusDTO
                {
                    StatusID = s.StatusID,
                    StatusName = s.StatusName,
                    StatusCssClass = s.StatusCssClass
                })
                .ToListAsync();

            return Ok(statuses);
        }

        // Admin + Faculty + Student
        // GET: api/Status/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<GetStatusDTO>> GetStatus(int id)
        {
            var status = await _context.Statuses
                .Where(s => s.StatusID == id)
                .Select(s => new GetStatusDTO
                {
                    StatusID = s.StatusID,
                    StatusName = s.StatusName,
                    StatusCssClass = s.StatusCssClass
                })
                .FirstOrDefaultAsync();

            if (status == null)
            {
                return NotFound(new
                {
                    message = $"Status with ID {id} not found."
                });
            }

            return Ok(status);
        }

        // Admin only
        // POST: api/Status
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GetStatusDTO>> PostStatus(
            AddEditStatusDTO dto)
        {
            var result = await _validator.ValidateAsync(dto);

            if (!result.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = result.Errors
                        .Select(x => x.ErrorMessage)
                        .ToList()
                });
            }

            var status = new SPM_Status
            {
                StatusName = dto.StatusName,
                StatusCssClass = dto.StatusCssClass
            };

            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();

            var resultDto = new GetStatusDTO
            {
                StatusID = status.StatusID,
                StatusName = status.StatusName,
                StatusCssClass = status.StatusCssClass
            };

            return CreatedAtAction(
                nameof(GetStatus),
                new { id = status.StatusID },
                resultDto);
        }

        // Admin only
        // PUT: api/Status/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutStatus(
            int id,
            AddEditStatusDTO dto)
        {
            var status = await _context.Statuses.FindAsync(id);

            if (status == null)
            {
                return NotFound(new
                {
                    message = $"Status with ID {id} not found."
                });
            }

            var result = await _validator.ValidateAsync(dto);

            if (!result.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = result.Errors
                        .Select(x => x.ErrorMessage)
                        .ToList()
                });
            }

            status.StatusName = dto.StatusName;
            status.StatusCssClass = dto.StatusCssClass;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Admin only
        // DELETE: api/Status/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var status = await _context.Statuses.FindAsync(id);

            if (status == null)
            {
                return NotFound(new
                {
                    message = $"Status with ID {id} not found."
                });
            }

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}