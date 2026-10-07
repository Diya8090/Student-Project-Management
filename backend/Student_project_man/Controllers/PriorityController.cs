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
    public class PriorityController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditPriorityDTO> _validator;

        public PriorityController(
            AppDbContext context,
            IValidator<AddEditPriorityDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // Admin + Faculty + Student
        // GET: api/Priority
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<IEnumerable<GetPriorityDTO>>> GetPriorities()
        {
            var priorities = await _context.Priorities
                .Select(p => new GetPriorityDTO
                {
                    PriorityID = p.PriorityID,
                    PriorityName = p.PriorityName,
                    PriorityCssClass = p.PriorityCssClass
                })
                .ToListAsync();

            return Ok(priorities);
        }

        // Admin + Faculty + Student
        // GET: api/Priority/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<GetPriorityDTO>> GetPriority(int id)
        {
            var priority = await _context.Priorities
                .Where(p => p.PriorityID == id)
                .Select(p => new GetPriorityDTO
                {
                    PriorityID = p.PriorityID,
                    PriorityName = p.PriorityName,
                    PriorityCssClass = p.PriorityCssClass
                })
                .FirstOrDefaultAsync();

            if (priority == null)
            {
                return NotFound(new
                {
                    message = $"Priority with ID {id} not found."
                });
            }

            return Ok(priority);
        }

        // Admin only
        // POST: api/Priority
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GetPriorityDTO>> PostPriority(
            AddEditPriorityDTO dto)
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

            var priority = new SPM_Priority
            {
                PriorityName = dto.PriorityName,
                PriorityCssClass = dto.PriorityCssClass
            };

            _context.Priorities.Add(priority);
            await _context.SaveChangesAsync();

            var resultDto = new GetPriorityDTO
            {
                PriorityID = priority.PriorityID,
                PriorityName = priority.PriorityName,
                PriorityCssClass = priority.PriorityCssClass
            };

            return CreatedAtAction(
                nameof(GetPriority),
                new { id = priority.PriorityID },
                resultDto);
        }

        // Admin only
        // PUT: api/Priority/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPriority(
            int id,
            AddEditPriorityDTO dto)
        {
            var priority = await _context.Priorities.FindAsync(id);

            if (priority == null)
            {
                return NotFound(new
                {
                    message = $"Priority with ID {id} not found."
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

            priority.PriorityName = dto.PriorityName;
            priority.PriorityCssClass = dto.PriorityCssClass;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Admin only
        // DELETE: api/Priority/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePriority(int id)
        {
            var priority = await _context.Priorities.FindAsync(id);

            if (priority == null)
            {
                return NotFound(new
                {
                    message = $"Priority with ID {id} not found."
                });
            }

            _context.Priorities.Remove(priority);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}